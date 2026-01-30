import db from './connection';

export const initializeDatabase = () => {
    // 1. Criação das tabelas iniciais
    db.exec(`
    -- 1. Categorias
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    );

    -- 2. Usuários
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('INSTRUCTOR', 'STUDENT', 'ADMIN')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Cursos
    CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price REAL DEFAULT 0,
        cover_image_url TEXT,
        max_students INTEGER,
        instructor_id TEXT NOT NULL,
        category_id TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
    `);

    // Migração para courses.is_active
    try {
        db.exec("ALTER TABLE courses ADD COLUMN is_active INTEGER DEFAULT 1");
    } catch (error: any) {
        if (!error.message.includes("duplicate column name")) {
            // console.error("Erro ao migrar tabela courses (is_active):", error);
        }
    }

    // Continuação da criação das tabelas
    db.exec(`
    -- 4. Módulos
    CREATE TABLE IF NOT EXISTS modules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        course_id TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE 
    );
    `);

    // Migração para modules.order_index
    try {
        db.exec("ALTER TABLE modules ADD COLUMN order_index INTEGER DEFAULT 0");
    } catch (error: any) {
        if (!error.message.includes("duplicate column name")) {
            // console.error("Erro ao migrar tabela modules (order_index):", error);
        }
    }

    db.exec(`
    -- 5. Aulas
    CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        video_url TEXT,
        material_url TEXT,
        module_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE 
    );

    -- 6. Avaliações
    CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- 7. Itens do Carrinho
    CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- 8. Matrículas
    CREATE TABLE IF NOT EXISTS enrollments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        certificate_hash TEXT,
        UNIQUE(user_id, course_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- 9. Progresso
    CREATE TABLE IF NOT EXISTS class_progress (
        user_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, class_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    );
    `);

    // Migração para class_progress.completed_at
    try {
        db.exec("ALTER TABLE class_progress ADD COLUMN completed_at DATETIME DEFAULT CURRENT_TIMESTAMP");
    } catch (error: any) {
        if (!error.message.includes("duplicate column name")) {
            // console.error("Erro ao migrar tabela class_progress (completed_at):", error);
        }
    }

};
