class Chatbox{
  static writeEvent(text){
    const chatHistory = $('#chat-history')
    const chatBox = $('#chat-box')
    chatHistory.append(`<li>${text}</li>`)
    chatBox.scrollTop(chatBox.height())
  }

  static writeMessage(message){
    const text = `${message.author} : ${message.content}`
    Chatbox.writeEvent(text);
  }
}
