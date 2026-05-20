export type TeacherStudent = {
  id: string;
  name: string;
  studentNumber: string | null;
};

export type TeacherClassOption = {
  id: string;
  name: string;
  students: TeacherStudent[];
};
