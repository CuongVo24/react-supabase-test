# 👥 Employee Management App (Quản lý Nhân viên)

A simple, fast, and modern Employee Management System built with **React**, **TypeScript**, **Vite**, and **Supabase**.

## 🚀 Features

- **View Employees**: Display a list of employees with their avatars, names, and formatted creation dates (dd/MM/yyyy).
- **Add Employee**: Create new employees using an intuitive form. Choose avatars dynamically loaded from the Supabase Storage Bucket. The avatar selection automatically filters out already-used images.
- **Edit Employee**: Update employee names directly within the table.
- **Delete Employee**: Remove an employee from the database, instantly freeing up their avatar for future use.
- **Real-time & Secure Database**: Data and storage managed by Supabase PostgreSQL, protected by Row Level Security (RLS) policies.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend & Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage Buckets
- **Styling**: Vanilla CSS

## 📋 Prerequisites

Before running this project, you need:
- Node.js (v18+)
- A Supabase account and project
- A Supabase Storage Bucket named `avatars` with 30 images uploaded.

## ⚙️ Setup Instructions

### 1. Supabase Configuration
Create a `.env` file in the `my-app` directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Database Schema:**
Table name: `Employee`
Columns:
- `id` (int8, primary key)
- `created_at` (timestamptz, default: now())
- `name` (text)
- `avatar` (text)

**RLS Policies Required:**
Execute the following in your Supabase SQL Editor:
```sql
-- For Table: Employee
CREATE POLICY "Allow public select" ON "Employee" FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON "Employee" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON "Employee" FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON "Employee" FOR DELETE USING (true);

-- For Storage Bucket: avatars
CREATE POLICY "Allow public select on avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
```

### 2. Run Locally

Navigate to the app directory:
```bash
cd my-app
```

Install dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.