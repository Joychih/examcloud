type ParsedExamInfo = {
  school: string;
  grade: string;
  year: string;
  semester: string;
  examType: string;
  group: string;
};

const DEFAULT_PARSED: ParsedExamInfo = {
  school: "",
  grade: "",
  year: "",
  semester: "",
  examType: "",
  group: "",
};

export const parseExamTitle = (input: string): ParsedExamInfo => {
  const tokens = input.trim().split(/\s+/);
  if (tokens.length < 3) return DEFAULT_PARSED;

  const [school, grade, year, semester, examType, group] = tokens;

  return {
    school: school ?? "",
    grade: grade ?? "",
    year: year ?? "",
    semester: semester ?? "",
    examType: examType ?? "",
    group: group ?? "",
  };
};
