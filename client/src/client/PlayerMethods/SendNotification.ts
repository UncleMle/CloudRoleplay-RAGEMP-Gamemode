const sendNotification = (text: string) => {
	mp.gui.chat.push(text);
}

export default sendNotification;
