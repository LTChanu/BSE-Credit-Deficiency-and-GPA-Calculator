document.getElementById("pasteButton").addEventListener("click", async () => {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById("inputData").value = text;
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
});

document.getElementById("clearButton").addEventListener("click", () => {
    document.getElementById("inputData").value = null;
});

document.getElementById("submitButton").addEventListener("click", () => {
    const inputData = document.getElementById("inputData").value;
    reset();
    processInput(inputData);
    calculateGPA(inputData);
});

const creditMap = {
    'I': { minCredits: 65, maxCredits: 76, minLevel5Above: 30, minLevel6: 15 },
    'M': { minCredits: 17, maxCredits: 28, minLevel5Above: 12, minLevel6: 0 },
    'J': { minCredits: 5, maxCredits: 16, minLevel5Above: 0, minLevel6: 0 },
    'Z': { minCredits: 12, maxCredits: 21, minLevel5Above: 3, minLevel6: 0 },
    'Y': { minCredits: 8, maxCredits: 12, minLevel5Above: 0, minLevel6: 6 },
    'L': { minCredits: 4, maxCredits: 4, minLevel5Above: 0, minLevel6: 0 },
    'W': { minCredits: 8, maxCredits: 8, minLevel5Above: 0, minLevel6: 0 }
};

let subTotalCredit = 134;
let passCredit = 0;
let targetCredit = 0;
let totalCredits = {};
let level5AboveCredits = {};
let level6Credits = {};

function reset() {
    subTotalCredit = 134;
    passCredit = 0;
    targetCredit = 0;
    totalCredits = {};
    level5AboveCredits = {};
    level6Credits = {};
    credits = 0;
}

function processInput(input) {
    const validCategories = ['E', 'X', 'I', 'M', 'J', 'Z', 'Y', 'W'];
    const courseLines = input.trim().split("\n");

    for (let courseLine of courseLines) {
        if (courseLine.length < 7) {
            continue;
        }

        if (validCategories.includes(courseLine.charAt(2))) {
            let courseCode = courseLine.substring(0, 7);
            let category = courseCode.charAt(2);
            if (category === 'X') {
                category = 'I';
            }

            let level = parseInt(courseCode.charAt(3));
            let credits = parseInt(courseCode.charAt(4));

            if (courseLine.includes("Pass")) {
                passCredit += credits;
            }

            if (courseCode.startsWith("LTE")) {
                category = 'L';
            }

            if (!courseLine.includes("Repeat")) {
                if (!(courseCode.startsWith("CSI") && courseLine.includes("Resit"))) {
                    if (!(courseCode.startsWith("ISI") && courseLine.includes("Resit"))) {
                        targetCredit += credits;
                        totalCredits[category] = (totalCredits[category] || 0) + credits;
                        if (level >= 5) {
                            level5AboveCredits[category] = (level5AboveCredits[category] || 0) + credits;
                        }
                        if (level === 6) {
                            level6Credits[category] = (level6Credits[category] || 0) + credits;
                        }
                    }
                }
            }
        }
    }

    // Update output fields
    updateOutputFields();
}

function updateOutputFields() {
    for (let category in creditMap) {
        let requirements = creditMap[category];
        let total = totalCredits[category] || 0;
        let level5Above = level5AboveCredits[category] || 0;
        let level6 = level6Credits[category] || 0;

        document.getElementById(`outputCategory${category}`).innerHTML = checkDeficiency(category, requirements, total, level5Above, level6);
    }

    document.getElementById("extraCreditsNeeded").innerHTML = `Extra credits needed: ${subTotalCredit > 0 ? subTotalCredit : 0}`;
    document.getElementById("passCredits").innerHTML = `Pass Credits: ${passCredit}`;
    document.getElementById("targetCredits").innerHTML = `Target Credits: ${targetCredit}`;
}

function checkDeficiency(category, requirements, total, level5Above, level6) {
    let output = `<strong>Category ${category === 'I' ? 'X and I' : category}:</strong><br>`;
    let temp = 0;
    let join = false;

    if (level6 < requirements.minLevel6 && (requirements.minLevel6 - level6) > 0) {
        output += `Level 6 credit deficiency: ${requirements.minLevel6 - level6}`;
        temp += (requirements.minLevel6 - level6);
        join = true;
    }

    if ((requirements.minLevel6 - level6) > 0) {
        if (level5Above < requirements.minLevel5Above && ((requirements.minLevel5Above - level5Above) - (requirements.minLevel6 - level6)) > 0) {
            if (join) {
                output += " and more ";
            }
            output += `Level 5 or above credit deficiency: ${((requirements.minLevel5Above - level5Above) - (requirements.minLevel6 - level6))}<br>`;
            temp += ((requirements.minLevel5Above - level5Above) - (requirements.minLevel6 - level6));
            join = true;
        }
    } else {
        if (level5Above < requirements.minLevel5Above && (requirements.minLevel5Above - level5Above) > 0) {
            if (join) {
                output += " and more ";
            }
            output += `Level 5 or above credit deficiency: ${requirements.minLevel5Above - level5Above}<br>`;
            temp += (requirements.minLevel5Above - level5Above);
            join = true;
        }
    }

    if (total < requirements.minCredits) {
        if (((requirements.minCredits - total) - temp) > 0) {
            if (join) {
                output += " and any level: ";
            }
            output += `${(requirements.minCredits - total - temp)} credits<br>`;
            temp += (requirements.minCredits - total - temp);
        }
    }

    subTotalCredit -= temp;
    subTotalCredit -= total;

    return output;
}






let credits = 0;

function calculateGPA(input) {
    let GP = 0;
    const totalCredits = 70;

    const level4C = ["EEI4346", "EEI4267", "EEI4362", "EEX4465", "MHZ4256", "EEI4361", "EEI4366", "AGM4367", "EEY4189", "MHZ4377"];
    const A = [], A_minus = [], B_plus = [], B = [], B_minus = [], C_plus = [], C = [];

    const courseLines = input.trim().split("\n");

    courseLines.forEach(courseLine => {
        if (courseLine.length < 7) {
            console.log("Invalid input line: " + courseLine);
            return;
        }

        if (courseLine.includes("Pass")) {
            const level = parseInt(courseLine.charAt(3));
            const numberOfCredits = parseInt(courseLine.charAt(4));
            const grade = extractGrade(courseLine);

            if (level === 5 || level === 6) {
                credits += numberOfCredits;
                GP = updateGP(GP, grade, numberOfCredits);
            } else if (level === 4 && level4C.includes(courseLine.substring(0, 7))) {
                switch (grade) {
                    case "A+": case "A": A.push(numberOfCredits); break;
                    case "A-": A_minus.push(numberOfCredits); break;
                    case "B+": B_plus.push(numberOfCredits); break;
                    case "B": B.push(numberOfCredits); break;
                    case "B-": B_minus.push(numberOfCredits); break;
                    case "C+": C_plus.push(numberOfCredits); break;
                    case "C": C.push(numberOfCredits); break;
                    default: break;
                }
            }
        }
    });

    GP = processGradeList(A, totalCredits, GP, 4);
    GP = processGradeList(A_minus, totalCredits, GP, 3.7);
    GP = processGradeList(B_plus, totalCredits, GP, 3.3);
    GP = processGradeList(B, totalCredits, GP, 3);
    GP = processGradeList(B_minus, totalCredits, GP, 2.7);
    GP = processGradeList(C_plus, totalCredits, GP, 2.3);
    GP = processGradeList(C, totalCredits, GP, 2);

    const GPA = Math.ceil((GP / credits) * 100) / 100;
    displayGPAResults(credits, GP, GPA);
}

function updateGP(GP, grade, numberOfCredits) {
    const gradeToGP = {
        "A+": 4, "A": 4, "A-": 3.7,
        "B+": 3.3, "B": 3, "B-": 2.7,
        "C+": 2.3, "C": 2
    };
    return Math.ceil((GP + (numberOfCredits * gradeToGP[grade])) * 100) / 100;
}

function processGradeList(gradeList, totalCredits, GP, gradeValue) {
    gradeList.forEach(element => {
        if (credits < totalCredits) {
            if (credits + element <= totalCredits) {
                credits += element;
                GP = Math.ceil((GP + (gradeValue * element)) * 100) / 100;
            } else {
                GP = Math.ceil((GP + (gradeValue * (totalCredits - credits))) * 100) / 100;
                credits = totalCredits;
            }
        }
    });
    return GP;
}

function extractGrade(line) {
    const regex = /Pass\s+(A\+|A-|A|B\+|B-|B|C\+|C)/;
    const match = line.match(regex);
    return match ? match[1] : null;
}

function displayGPAResults(credits, GP, GPA) {
    const outputCategoryNoOfGPACredits = document.getElementById("outputCategoryNoOfGPACredits");
    const outputCategoryGP = document.getElementById("outputCategoryGP");
    const outputCategoryGPA = document.getElementById("outputCategoryGPA");
    const outputCategoryDegreeClass = document.getElementById("outputCategoryDegreeClass");

    outputCategoryNoOfGPACredits.innerHTML = `<strong>No. of Credits:</strong> ${credits}`;
    outputCategoryGP.innerHTML = `<strong>Your GP:</strong> ${GP}`;
    outputCategoryGPA.innerHTML = `<strong>Your GPA:</strong> ${GPA}`;
    outputCategoryDegreeClass.innerHTML = `<strong>Degree Classification:</strong> ${getDegreeClass(GPA)}`;
}

function getDegreeClass(gpa) {
    if (gpa >= 3.7) {
        return "First Class in Bachelor of Software Engineering Honours";
    } else if (gpa >= 3.3) {
        return "Second Class (Upper Division) in Bachelor of Software Engineering Honours";
    } else if (gpa >= 3.0) {
        return "Second Class (Lower Division) in Bachelor of Software Engineering Honours";
    } else {
        return "Pass in Bachelor of Software Engineering Honours";
    }
}