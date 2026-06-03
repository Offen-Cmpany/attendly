import React from 'react';
import { useAuth } from '../../src/lib/auth';
import StudentHome from '../../src/screens/StudentHome';
import TeacherHome from '../../src/screens/TeacherHome';
import AdminHome from '../../src/screens/AdminHome';

export default function Home() {
  const { role } = useAuth();
  if (role === 'teacher') return <TeacherHome />;
  if (role === 'admin') return <AdminHome />;
  return <StudentHome />;
}
