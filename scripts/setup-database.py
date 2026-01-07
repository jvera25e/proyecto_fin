#!/usr/bin/env python3
"""
Script de configuración de base de datos para la aplicación financiera
Configura PostgreSQL con todos los datos necesarios
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('database_setup.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class DatabaseSetup:
    def __init__(self):
        """Inicializar configuración de base de datos"""
        self.config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'password'),
            'database': os.getenv('DB_NAME', 'financial_app'),
            'admin_database': os.getenv('DB_ADMIN_DATABASE', 'postgres')
        }
        
        logger.info("Configuración de base de datos inicializada")
        logger.info(f"Host: {self.config['host']}:{self.config['port']}")
        logger.info(f"Base de datos: {self.config['database']}")

    def create_database(self):
        """Crear la base de datos si no existe"""
        try:
            # Conectar a la base de datos administrativa
            conn = psycopg2.connect(
                host=self.config['host'],
                port=self.config['port'],
                user=self.config['user'],
                password=self.config['password'],
                database=self.config['admin_database']
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = conn.cursor()
            
            # Verificar si la base de datos existe
            cursor.execute(
                "SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s",
                (self.config['database'],)
            )
            
            if cursor.fetchone():
                logger.info(f"La base de datos '{self.config['database']}' ya existe")
            else:
                # Crear la base de datos
                cursor.execute(f"CREATE DATABASE {self.config['database']}")
                logger.info(f"Base de datos '{self.config['database']}' creada exitosamente")
            
            cursor.close()
            conn.close()
            return True
            
        except psycopg2.Error as e:
            logger.error(f"Error al crear la base de datos: {e}")
            return False

    def connect_to_database(self):
        """Conectar a la base de datos principal"""
        try:
            conn = psycopg2.connect(
                host=self.config['host'],
                port=self.config['port'],
                user=self.config['user'],
                password=self.config['password'],
                database=self.config['database']
            )
            logger.info("Conexión a la base de datos establecida")
            return conn
        except psycopg2.Error as e:
            logger.error(f"Error al conectar a la base de datos: {e}")
            return None

    def execute_sql_file(self, conn, file_path, description=""):
        """Ejecutar un archivo SQL"""
        try:
            if not os.path.exists(file_path):
                logger.error(f"Archivo SQL no encontrado: {file_path}")
                return False
            
            with open(file_path, 'r', encoding='utf-8') as file:
                sql_content = file.read()
            
            cursor = conn.cursor()
            
            # Dividir el contenido en statements individuales
            statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
            
            logger.info(f"Ejecutando {description}: {len(statements)} statements")
            
            for i, statement in enumerate(statements, 1):
                try:
                    cursor.execute(statement)
                    logger.debug(f"Statement {i}/{len(statements)} ejecutado exitosamente")
                except psycopg2.Error as e:
                    logger.warning(f"Error en statement {i}: {e}")
                    # Continuar con el siguiente statement
                    conn.rollback()
                    continue
            
            conn.commit()
            cursor.close()
            logger.info(f"{description} ejecutado exitosamente")
            return True
            
        except Exception as e:
            logger.error(f"Error ejecutando {description}: {e}")
            conn.rollback()
            return False

    def verify_installation(self, conn):
        """Verificar que la instalación fue exitosa"""
        try:
            cursor = conn.cursor()
            
            # Verificar tablas principales
            tables_to_check = [
                'users', 'accounts', 'transactions', 'categories',
                'budgets', 'financial_goals', 'notifications'
            ]
            
            logger.info("Verificando instalación...")
            
            for table in tables_to_check:
                cursor.execute(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = %s",
                    (table,)
                )
                if cursor.fetchone()[0] == 0:
                    logger.error(f"Tabla '{table}' no encontrada")
                    return False
                else:
                    logger.info(f"✓ Tabla '{table}' creada correctamente")
            
            # Verificar datos de prueba
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM categories WHERE is_system = true")
            category_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM transactions")
            transaction_count = cursor.fetchone()[0]
            
            logger.info(f"✓ Usuarios: {user_count}")
            logger.info(f"✓ Categorías del sistema: {category_count}")
            logger.info(f"✓ Transacciones de prueba: {transaction_count}")
            
            cursor.close()
            
            if user_count > 0 and category_count > 0:
                logger.info("✅ Instalación verificada exitosamente")
                return True
            else:
                logger.error("❌ Faltan datos esenciales")
                return False
                
        except psycopg2.Error as e:
            logger.error(f"Error verificando instalación: {e}")
            return False

    def create_backup(self, conn):
        """Crear un backup de la base de datos"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"backup_financial_app_{timestamp}.sql"
            
            # Usar pg_dump para crear el backup
            dump_command = f"""pg_dump -h {self.config['host']} -p {self.config['port']} -U {self.config['user']} -d {self.config['database']} -f {backup_file}"""
            
            logger.info(f"Creando backup: {backup_file}")
            os.system(dump_command)
            
            if os.path.exists(backup_file):
                logger.info(f"✅ Backup creado exitosamente: {backup_file}")
                return backup_file
            else:
                logger.warning("No se pudo crear el backup")
                return None
                
        except Exception as e:
            logger.error(f"Error creando backup: {e}")
            return None

    def setup_complete_database(self):
        """Configurar la base de datos completa"""
        logger.info("🚀 Iniciando configuración de base de datos...")
        
        # Paso 1: Crear base de datos
        if not self.create_database():
            logger.error("❌ Falló la creación de la base de datos")
            return False
        
        # Paso 2: Conectar a la base de datos
        conn = self.connect_to_database()
        if not conn:
            logger.error("❌ No se pudo conectar a la base de datos")
            return False
        
        try:
            # Paso 3: Ejecutar esquema
            schema_file = os.path.join(os.path.dirname(__file__), 'database-schema.sql')
            if not self.execute_sql_file(conn, schema_file, "Esquema de base de datos"):
                logger.error("❌ Falló la creación del esquema")
                return False
            
            # Paso 4: Insertar datos de prueba
            seed_file = os.path.join(os.path.dirname(__file__), 'seed-data.sql')
            if not self.execute_sql_file(conn, seed_file, "Datos de prueba"):
                logger.error("❌ Falló la inserción de datos de prueba")
                return False
            
            # Paso 5: Verificar instalación
            if not self.verify_installation(conn):
                logger.error("❌ Falló la verificación de la instalación")
                return False
            
            # Paso 6: Crear backup inicial
            backup_file = self.create_backup(conn)
            
            logger.info("🎉 ¡Configuración de base de datos completada exitosamente!")
            logger.info("📊 Resumen:")
            logger.info("   - Base de datos creada")
            logger.info("   - Esquema instalado")
            logger.info("   - Datos de prueba insertados")
            logger.info("   - Instalación verificada")
            if backup_file:
                logger.info(f"   - Backup creado: {backup_file}")
            
            logger.info("\n🔐 Credenciales de usuario demo:")
            logger.info("   Email: demo@financialapp.com")
            logger.info("   Password: demo123")
            
            return True
            
        finally:
            conn.close()

def main():
    """Función principal"""
    print("=" * 60)
    print("🏦 CONFIGURADOR DE BASE DE DATOS - FINANCIAL APP")
    print("=" * 60)
    
    # Verificar variables de entorno
    required_vars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.warning(f"Variables de entorno faltantes: {missing_vars}")
        logger.info("Usando valores por defecto...")
    
    # Configurar base de datos
    db_setup = DatabaseSetup()
    
    try:
        success = db_setup.setup_complete_database()
        
        if success:
            print("\n✅ CONFIGURACIÓN EXITOSA")
            print("La base de datos está lista para usar.")
            print("\nPróximos pasos:")
            print("1. Configurar las variables de entorno en tu aplicación")
            print("2. Ejecutar la aplicación Next.js")
            print("3. Probar el login con las credenciales demo")
            sys.exit(0)
        else:
            print("\n❌ CONFIGURACIÓN FALLIDA")
            print("Revisa los logs para más detalles.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("\n⏹️  Configuración cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
