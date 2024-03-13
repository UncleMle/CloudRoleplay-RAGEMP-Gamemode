export function getFormattedDateString(dateString: string): string {
    let date: Date = new Date(dateString);

    let formattedStr = "";

    formattedStr += date.toDateString();
    formattedStr += " @" + (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
    formattedStr += (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());

    return formattedStr;
}