import db from './connection';

export const initializeDatabase = () => {
    db.exec(`
    -- 1. Categorias
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    );

    -- 2. Usuários (Adicionado INSTRUCTOR ao CHECK)
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('INSTRUCTOR', 'STUDENT')) NOT NULL,
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

    // tenta adicionar a coluna is_active se ela não existir (para bancos já criados)
    try {
        db.exec("ALTER TABLE courses ADD COLUMN is_active INTEGER DEFAULT 1");
    } catch (error: any) {
        // ignora erro se a coluna já existir
        if (!error.message.includes("duplicate column name")) {
             console.error("Erro ao migrar tabela courses:", error);
        }
    }

    -- 4. Módulos
    CREATE TABLE IF NOT EXISTS modules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        course_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE 
    );

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
    console.log("Banco de dados inicializado com esquema completo.");
};
