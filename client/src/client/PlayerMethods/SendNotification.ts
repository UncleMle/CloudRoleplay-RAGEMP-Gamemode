const sendNotification = (message: string) => {
	mp.gui.chat.push(message);
}

export default sendNotification;
