from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
DATABASE = 'database/school.db'

def get_db_connection():
    try:
        if not os.path.exists('database'):
            os.makedirs('database')
            
        db_path = os.path.abspath(DATABASE)
        # Adicionando timeout e checagem de busy_timeout
        conn = sqlite3.connect(DATABASE, timeout=20)
        conn.execute('PRAGMA busy_timeout = 10000')  # 10 segundos de timeout
        conn.row_factory = sqlite3.Row
        
        return conn
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

# Rota de teste para verificar se o servidor está funcionando
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Servidor está funcionando!'}), 200

# Criar as tabelas do banco de dados
def init_db():
    try:
        if not os.path.exists('database'):
            os.makedirs('database')
        
        conn = get_db_connection()
        if conn is None:
            print("Não foi possível inicializar o banco de dados")
            return
            
        cursor = conn.cursor()
        
        # Criar tabelas
        cursor.executescript('''
            -- Criar tabela de escolas primeiro
            CREATE TABLE IF NOT EXISTS schools (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Depois criar as outras tabelas
            CREATE TABLE IF NOT EXISTS professors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                school_id INTEGER,
                FOREIGN KEY (school_id) REFERENCES schools(id)
            );

            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                period TEXT NOT NULL,
                school_id INTEGER,
                FOREIGN KEY (school_id) REFERENCES schools(id)
            );

            CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                day_of_week TEXT NOT NULL,
                time_slot TEXT NOT NULL,
                professor_name TEXT,
                class_name TEXT,
                subject TEXT,
                school_id INTEGER,
                FOREIGN KEY (school_id) REFERENCES schools(id),
                FOREIGN KEY (professor_name) REFERENCES professors (name),
                FOREIGN KEY (class_name) REFERENCES classes (name)
            );

            CREATE TABLE IF NOT EXISTS saved_schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                school_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                schedule_data TEXT NOT NULL,
                school_id INTEGER,
                FOREIGN KEY (school_id) REFERENCES schools(id)
            );

            CREATE TABLE IF NOT EXISTS schedule_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                schedule_id INTEGER,
                action_type TEXT NOT NULL,  -- 'edit', 'delete', etc
                action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                old_data TEXT,
                new_data TEXT,
                description TEXT,
                FOREIGN KEY (schedule_id) REFERENCES schedule(id)
            );
        ''')
        
        conn.commit()
        conn.close()
        print("Banco de dados inicializado com sucesso!")
    except Exception as e:
        print(f"Erro ao inicializar o banco de dados: {e}")

# Rotas da API
@app.route('/api/professors', methods=['GET', 'POST'])
def handle_professors():
    try:
        if request.method == 'GET':
            conn = get_db_connection()
            if conn is None:
                return jsonify({'error': 'Erro de conexão com o banco de dados'}), 500
                
            professors = conn.execute('SELECT * FROM professors').fetchall()
            conn.close()
            return jsonify([dict(row) for row in professors])
        
        if request.method == 'POST':
            data = request.get_json()
            if not data or 'name' not in data or 'email' not in data:
                return jsonify({'error': 'Dados incompletos'}), 400
                
            conn = get_db_connection()
            if conn is None:
                return jsonify({'error': 'Erro de conexão com o banco de dados'}), 500
                
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO professors (name, email) VALUES (?, ?)',
                (data['name'], data['email'])
            )
            conn.commit()
            conn.close()
            return jsonify({'message': 'Professor cadastrado com sucesso'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Nova rota para gerenciar turmas
@app.route('/api/classes', methods=['GET', 'POST'])
def handle_classes():
    conn = None
    try:
        if request.method == 'GET':
            conn = get_db_connection()
            if conn is None:
                return jsonify({'error': 'Erro de conexão com o banco de dados'}), 500
                
            classes = conn.execute('SELECT * FROM classes').fetchall()
            return jsonify([dict(row) for row in classes])
        
        if request.method == 'POST':
            data = request.get_json()
            if not data or 'name' not in data or 'period' not in data:
                return jsonify({'error': 'Dados incompletos'}), 400
                
            conn = get_db_connection()
            if conn is None:
                return jsonify({'error': 'Erro de conexão com o banco de dados'}), 500
                
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO classes (name, period) VALUES (?, ?)',
                (data['name'], data['period'])
            )
            conn.commit()
            return jsonify({'message': 'Turma cadastrada com sucesso'}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# Rota para gerenciar turmas específicas (atualizar e deletar)
@app.route('/api/classes/<int:class_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_specific_class(class_id):
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Erro de conexão com o banco de dados'}), 500

        if request.method == 'GET':
            class_data = conn.execute('SELECT * FROM classes WHERE id = ?', 
                                    (class_id,)).fetchone()
            conn.close()
            
            if class_data is None:
                return jsonify({'error': 'Turma não encontrada'}), 404
                
            return jsonify(dict(class_data))

        elif request.method == 'PUT':
            data = request.get_json()
            if not data or 'name' not in data or 'period' not in data:
                return jsonify({'error': 'Dados incompletos'}), 400

            cursor = conn.cursor()
            cursor.execute('''
                UPDATE classes 
                SET name = ?, period = ?
                WHERE id = ?
            ''', (data['name'], data['period'], class_id))
            
            conn.commit()
            conn.close()
            
            if cursor.rowcount == 0:
                return jsonify({'error': 'Turma não encontrada'}), 404
                
            return jsonify({'message': 'Turma atualizada com sucesso'})

        elif request.method == 'DELETE':
            cursor = conn.cursor()
            cursor.execute('DELETE FROM classes WHERE id = ?', (class_id,))
            conn.commit()
            conn.close()
            
            if cursor.rowcount == 0:
                return jsonify({'error': 'Turma não encontrada'}), 404
                
            return jsonify({'message': 'Turma removida com sucesso'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Nova rota para salvar horários
@app.route('/api/schedule', methods=['GET', 'POST'])
def handle_schedule():
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Erro de conexão com o banco de dados'}), 500

        if request.method == 'GET':
            schedule = conn.execute('SELECT * FROM schedule').fetchall()
            return jsonify([dict(row) for row in schedule])

        if request.method == 'POST':
            data = request.get_json()
            cursor = conn.cursor()
            
            # Limpa os horários existentes
            cursor.execute('DELETE FROM schedule')
            
            # Insere os novos horários
            for item in data:
                cursor.execute('''
                    INSERT INTO schedule (day_of_week, time_slot, professor_name, class_name, subject)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    item['day'],
                    item['time'],
                    item.get('professor'),
                    item.get('class'),
                    item.get('subject')
                ))
            
            conn.commit()
            return jsonify({'message': 'Horários salvos com sucesso'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# Nova rota para limpar todos os dados
@app.route('/api/clear-all', methods=['POST'])
def clear_all_data():
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Erro de conexão com o banco de dados'}), 500
            
        cursor = conn.cursor()
        cursor.executescript('''
            DELETE FROM professors;
            DELETE FROM classes;
            DELETE FROM schedule;
            -- Resetar os auto-incrementos
            DELETE FROM sqlite_sequence WHERE name IN ('professors', 'classes', 'schedule');
        ''')
        conn.commit()
        conn.close()
        return jsonify({'message': 'Todos os dados foram removidos com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/saved-schedules', methods=['GET', 'POST'])
def handle_saved_schedules():
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            # Buscar últimos 18 meses
            data_limite = datetime.now() - timedelta(days=18*30)
            horarios = conn.execute('''
                SELECT * FROM saved_schedules 
                WHERE data > ? 
                ORDER BY data DESC
            ''', (data_limite.isoformat(),)).fetchall()
            
            return jsonify([dict(row) for row in horarios])
            
        if request.method == 'POST':
            data = request.get_json()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO saved_schedules (data, horarios, descricao)
                VALUES (?, ?, ?)
            ''', (data['data'], json.dumps(data['horarios']), data['descricao']))
            
            conn.commit()
            return jsonify({'message': 'Salvo com sucesso'}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# Nova rota para escolas
@app.route('/api/schools', methods=['GET', 'POST'])
def handle_schools():
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Erro de conexão com o banco de dados'}), 500

        if request.method == 'GET':
            schools = conn.execute('SELECT * FROM schools ORDER BY created_at DESC').fetchall()
            return jsonify([dict(row) for row in schools])

        if request.method == 'POST':
            data = request.get_json()
            if not data or 'nome' not in data:
                return jsonify({'error': 'Nome da escola é obrigatório'}), 400

            cursor = conn.cursor()
            try:
                cursor.execute('INSERT INTO schools (nome) VALUES (?)', (data['nome'],))
                conn.commit()
                
                # Retornar a escola recém-criada
                new_school = cursor.execute(
                    'SELECT * FROM schools WHERE id = ?', 
                    (cursor.lastrowid,)
                ).fetchone()
                
                return jsonify({
                    'message': 'Escola cadastrada com sucesso',
                    'school': dict(new_school)
                }), 201
            except sqlite3.IntegrityError:
                return jsonify({'error': 'Escola já existe'}), 409

    except Exception as e:
        print(f"Erro ao manipular escolas: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# Rota para dados específicos de uma escola
@app.route('/api/schools/<int:school_id>/data', methods=['GET'])
def get_school_data(school_id):
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Erro de conexão com o banco de dados'}), 500

        # Buscar dados da escola
        professores = conn.execute('SELECT * FROM professors WHERE school_id = ?', (school_id,)).fetchall()
        turmas = conn.execute('SELECT * FROM classes WHERE school_id = ?', (school_id,)).fetchall()
        horarios = conn.execute('SELECT * FROM schedule WHERE school_id = ?', (school_id,)).fetchall()

        return jsonify({
            'professores': [dict(row) for row in professores],
            'turmas': [dict(row) for row in turmas],
            'horarios': [dict(row) for row in horarios]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# Rota para o histórico de alterações
@app.route('/api/history', methods=['GET', 'POST'])
def handle_history():
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            # Buscar histórico dos últimos 18 meses
            data_limite = datetime.now() - timedelta(days=18*30)
            historico = conn.execute('''
                SELECT * FROM schedule_history 
                WHERE created_at > ? 
                ORDER BY created_at DESC
            ''', (data_limite.isoformat(),)).fetchall()
            
            return jsonify([dict(row) for row in historico])
            
        if request.method == 'POST':
            data = request.get_json()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO schedule_history (
                    schedule_data,
                    description,
                    created_at
                ) VALUES (?, ?, CURRENT_TIMESTAMP)
            ''', (
                json.dumps(data['horarios']),
                data['descricao']
            ))
            
            conn.commit()
            return jsonify({'message': 'Histórico salvo com sucesso'}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# Rota para buscar histórico por data
@app.route('/api/history/date/<date>', methods=['GET'])
def get_history_by_date(date):
    try:
        conn = get_db_connection()
        historico = conn.execute('''
            SELECT * FROM schedule_history 
            WHERE DATE(created_at) = DATE(?)
            ORDER BY created_at DESC
        ''', (date,)).fetchall()
        
        return jsonify([dict(row) for row in historico])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/history/dates', methods=['GET'])
def get_history_dates():
    try:
        conn = get_db_connection()
        # Buscar todas as datas que têm cadastros
        datas = conn.execute('''
            SELECT DISTINCT DATE(created_at) as data
            FROM schedule_history 
            ORDER BY data DESC
        ''').fetchall()
        
        return jsonify([dict(row) for row in datas])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    try:
        print("Iniciando o servidor...")
        init_db()
        print("Tentando iniciar o servidor na porta 8000...")
        # Mudando para porta 8000
        app.run(host='0.0.0.0', port=8000, debug=True)
    except Exception as e:
        print(f"Erro ao iniciar o servidor: {e}")