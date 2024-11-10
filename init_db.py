import sqlite3
import os

def init_db():
    try:
        if not os.path.exists('database'):
            os.makedirs('database')
        
        conn = sqlite3.connect('database/school.db')
        cursor = conn.cursor()
        
        # Criar tabelas
        cursor.executescript('''
            -- Tabela de professores
            CREATE TABLE IF NOT EXISTS professors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                disponibilidade TEXT NOT NULL,
                folga_dias TEXT NOT NULL,
                folga_turnos TEXT NOT NULL,
                quantidade_aulas INTEGER NOT NULL
            );

            -- Tabela de turmas
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );

            -- Tabela de horários
            CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                day_of_week TEXT NOT NULL,
                time_slot TEXT NOT NULL,
                professor_name TEXT,
                subject TEXT,
                class_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (professor_name) REFERENCES professors (name)
            );

            -- Tabela de histórico de alterações
            CREATE TABLE IF NOT EXISTS schedule_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                schedule_data TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        
        conn.commit()
        conn.close()
        print("Banco de dados inicializado com sucesso!")
    except Exception as e:
        print(f"Erro ao inicializar o banco de dados: {e}")

if __name__ == '__main__':
    init_db()