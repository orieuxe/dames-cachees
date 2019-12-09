class Chatbox{
  static writeEvent(text){
    Chatbox.addText(text);
  }

  static writeMessage(message){
    Chatbox.addText(`<b>${message.author}</b> ${message.content}`);
  }

  static addText(text){
    const chatHistory = $('#chat-history')
    const chatBox = $('#chat-box')
    chatHistory.append(`<li>${text}</li>`)
    chatBox.scrollTop(chatHistory.height())
  }
}
