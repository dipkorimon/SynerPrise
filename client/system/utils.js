export function isPureCode(text) {
    // Basic check: no periods, all lines look like Python, starts with def/class/import etc.
    const lines = text.trim().split("\n");
    const codeIndicators = ["def ", "class ", "import ", "return", "for ", "if ", "while ", "print", "="];
    return (
        lines.length > 0 &&
        lines.every((line) => codeIndicators.some((keyword) => line.trim().startsWith(keyword)))
    );
}