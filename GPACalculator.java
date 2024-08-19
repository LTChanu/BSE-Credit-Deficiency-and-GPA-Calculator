import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GPACalculator {

    private static int credits = 0;

    public static void main(String[] args) {
        float GP = 0;
        final int totalCredits = 70;

        List<String> level4C = Arrays.asList("EEI4346", "EEI4267", "EEI4362", "EEX4465", "MHZ4256", "EEI4361", "EEI4366", "AGM4367", "EEY4189", "MHZ4377");
        List<Integer> A = new ArrayList<>();
        List<Integer> A_minus = new ArrayList<>();
        List<Integer> B_plus = new ArrayList<>();
        List<Integer> B = new ArrayList<>();
        List<Integer> B_minus = new ArrayList<>();
        List<Integer> C_plus = new ArrayList<>();
        List<Integer> C = new ArrayList<>();

        try (Scanner scanner = new Scanner(System.in)) {
            System.out.println("Enter courses (one per line). Press Enter twice to finish input:");

            StringBuilder input = new StringBuilder();
            String line;
            while (!(line = scanner.nextLine()).isEmpty()) {
                input.append(line).append("\n");
            }

            String[] courseLines = input.toString().split("\n");

            for (String courseLine : courseLines) {
                if (courseLine.length() < 7) {
                    System.out.println("Invalid input line: " + courseLine);
                    continue;
                }

                
                if (courseLine.contains("Pass")) {

                    char levelChar = courseLine.charAt(3);
                    int level = Character.getNumericValue(levelChar);
                    int numberOfCredits = Character.getNumericValue(courseLine.charAt(4));
                    String grade = grade(courseLine);
                
                    if (level == 5 || level == 6) {
                        credits += numberOfCredits;
                        switch (grade) {
                            case "A+": 
                                GP = (float) Math.ceil((GP+ (numberOfCredits * 4))* 100) / 100; break;
                            case "A": 
                                GP = (float) Math.ceil((GP+ (numberOfCredits * 4))* 100) / 100; break;
                            case "A-":
                                GP = (float) Math.ceil((GP+ (numberOfCredits * 3.7))* 100) / 100; break;
                            case "B+":
                                GP = (float) Math.ceil((GP+ (numberOfCredits * 3.3))* 100) / 100; break;
                            case "B":
                                GP = (float) Math.ceil((GP+ (numberOfCredits * 3))* 100) / 100; break;
                            case "B-":
                                GP = (float) Math.ceil((GP+ (numberOfCredits * 2.7))* 100) / 100; break;
                            case "C+":
                                GP = (float) Math.ceil((GP+ (numberOfCredits * 2.3))* 100) / 100; break;
                            case "C":
                                GP = (float) Math.ceil((GP+ (numberOfCredits * 2))* 100) / 100; break;
                            default:
                                break;
                        }
                    } else if (level == 4 && level4C.contains(courseLine.substring(0, 7))) {
                        switch (grade) {
                            case "A+": 
                                A.add(numberOfCredits); break;
                            case "A": 
                                A.add(numberOfCredits); break;
                            case "A-":
                                A_minus.add(numberOfCredits); break;
                            case "B+":
                                B_plus.add(numberOfCredits); break;
                            case "B":
                                B.add(numberOfCredits); break;
                            case "B-":
                                B_minus.add(numberOfCredits); break;
                            case "C+":
                                C_plus.add(numberOfCredits); break;
                            case "C":
                                C.add(numberOfCredits); break;                        
                            default:
                                break;
                        }
                    }
                }
                
            }
        }
        
        // Process lists A, A-, B+, B, B-, C+, C
        GP = processGradeList(A, totalCredits, GP, 4);
        GP = processGradeList(A_minus, totalCredits, GP, 3.7f);
        GP = processGradeList(B_plus, totalCredits, GP, 3.3f);
        GP = processGradeList(B, totalCredits, GP, 3);
        GP = processGradeList(B_minus, totalCredits, GP, 2.7f);
        GP = processGradeList(C_plus, totalCredits, GP, 2.3f);
        GP = processGradeList(C, totalCredits, GP, 2);

        float GPA = (float) Math.ceil((GP / credits)* 100) / 100;
        System.out.println("No. of Credits is: " + credits);
        System.out.println("Your GP is: " + GP);
        System.out.println("Your GPA is: " + GPA);
        degreeClass(GPA);
    }

    private static void degreeClass(float gpa) {
        System.out.print("You ");
        if(gpa >= 3.7){
            System.out.print("have First Class");
        }
        else if(gpa >= 3.3){
            System.out.print("have Second Class (Upper Division)");
        }
        else if(gpa >= 3.0){
            System.out.print("have Second Class (Lower Division)");
        }
        else{
            System.out.print("are Pass");
        }
        System.out.print(" in Bachelor of Software Engineering Honours");
    }

    private static float processGradeList(List<Integer> gradeList, final int totalCredits, float GP, float gradeValue) {
        for (int element : gradeList) {
            if (credits < totalCredits) {
                if (credits + element <= totalCredits) {
                    credits += element;
                    GP = (float) Math.ceil((GP+ (gradeValue * element))* 100) / 100;
                } else {
                    GP = (float) Math.ceil((GP+ (gradeValue * (totalCredits - credits)))* 100) / 100;
                    credits = totalCredits;
                }
            }
        }
        return GP;
    }

    private static String grade(String line) {
        // Define a regex pattern to match "Pass" followed by any amount of space and then the exact grade
        String regex = "Pass\\s+(A\\+|A-|A|B\\+|B-|B|C\\+|C-|C)";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(line);

        // Return the matched grade if found, otherwise return null
        if (matcher.find()) {
            return matcher.group(1);  // group(1) returns the first capturing group, which is the grade
        } else {
            return null;
        }
    }
}
