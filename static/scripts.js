
let onlineUsers= []
const currentUid= document.getElementById('user').getAttribute('uid')
const chat_window= document.getElementById("chat-window")
const default_main_window= `
<h2 class="text-center text-muted mt-4">
    Click on Your Friends to open a Conversation
</h2>`
const socket= io('http://localhost:3000/')

//socket
socket.emit('userOnline', currentUid)
socket.on('getOnlineUsers', users=> {
    onlineUsers=users
})
socket.on('receiveFriendReq', ({name, id})=> {
    const FriendRequestsList= document.getElementById('FriendRequests')
    FriendRequestsList.innerHTML+= `
        <li class="friend d-flex" onclick="open_profile('${id}')">
            <img src="https://bootdey.com/img/Content/avatar/avatar1.png" 
              alt="avatar" width="30" height="30">
            <div class="about">
            ${name}
            </div>
        </li>
    `
    showToast("friendToast", `You received a Friend Request from ${name}`)
})
socket.on('acceptedFriendReq', ({name, id})=> {
    const friendsList= document.getElementById('friends_list')
    friendsList.innerHTML+=
    `
        <li class="friend d-flex justify-content-between" onclick="open_chat(this)" f_id="${id}" f_name="${name}">
            <div>
                <img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="avatar">
                <div class="about">
                    ${name}
                </div>
            </div>
            <div class="newMsgAlert bg-danger p-1"></div>
        </li>
    `
    showToast("friendToast", `${name} accepted your friend request`)
})
socket.on('receiveMessage', ({sender, msg})=> {
    const msg_input= document.getElementById("msg_input")
    if(msg_input?.getAttribute('f_id') === sender){
        createMsgElement(msg, true)
    }else{
        const senderChat= document.querySelector(`[f_id="${sender}"]`)
        senderChat.querySelector('.newMsgAlert').style.display = 'block'
        showToast("msgToast", "You received a Message")
    }
})

/////////// helpers
function showToast(toastId, toastMsg){
    const msgToast= document.getElementById(toastId)
    msgToast.querySelector('.toast-body').textContent= toastMsg
    let bsAlert = new bootstrap.Toast(msgToast)
    bsAlert.show()
}

function createMsgElement(msg, isReceived){
    const chatContainer= document.getElementById("chat-container")
    let msgContainer= document.createElement("li")
    msgContainer.classList.add('msg-container')
    let msgBody= document.createElement("span")
    if(isReceived){
        msgBody.classList.add('msg-body', 'alert-secondary')

    } else{
        msgBody.classList.add('msg-body', 'alert-success')
        msgContainer.classList.add('sender-container')
    } 
    msgBody.innerHTML= msg
    msgContainer.appendChild(msgBody)
    chatContainer.appendChild(msgContainer)
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
/////////// helpers

function open_chat(elem){
    const friendId= $(elem).attr('f_id')
    $.ajax({
        url: `/convo/${friendId}`,
        dataType: 'json',
        method: 'get',

        success: (data)=>{
            if(data.err){
                showToast("errorToast", data.err)
            }else{
                $(elem).find('.newMsgAlert').hide()
                chat_window.innerHTML= `
                    <div class="h-100 overflow-hidden" style="display:contents;">
                        <a onclick="open_profile('${friendId}')" class="d-flex align-items-center link-body-emphasis text-decoration-none">
                            <img src="https://bootdey.com/img/Content/avatar/avatar1.png" width="50" height="50" class="rounded-circle me-2">
                            <h4>${$(elem).attr('f_name')}</h4>
                            ${
                                onlineUsers.find(u=> u.uid===friendId)?
                                `<small id="chat-status" class="text-success ms-3">Online</small>`
                                :
                                `<small class="text-danger ms-3">Offline</small>`
                            }
                        </a>
                        <hr>
                        <ul id="chat-container">
                        </ul>
                    </div>
                    
                    <div class="form-inline w-100 my-2 m-auto d-flex">
                        <input class="form-control mr-sm-2" type="search" id="msg_input"
                        placeholder="Send text" f_id="${friendId}" convo_id="${data.convoId}">
                        <button id="send_btn" onclick="send_msg()"
                        class="btn btn-outline-success my-2 mx-3">Send
                        </button>
                    </div>
                `
                data.messages.forEach(msg => {
                    createMsgElement(msg.content, msg.sender == friendId?true:false)
                });            
            }
        },
		error: (e)=> {
			alert(e.message);
		}
    })
}

function send_msg(){
    const msg_input= document.getElementById("msg_input")
    const receiverId= msg_input.getAttribute('f_id')
    const convoId= msg_input.getAttribute('convo_id')
    const msgText=  msg_input.value
    if(msgText == ''){
        alert('Cannot send an empty Message')
    }else{
        $.ajax({
            url: `/convo/send/${convoId}`,
            dataType: 'json',
            method: 'post',
            data: {'content': msgText},

            success: (msg)=>{
                if(msg.content){
                    //socket
                    socket.emit('sendMessage', {
                        sender: msg.sender, receiver:receiverId, msg: msgText
                    })
                    ////// 
                    createMsgElement(msg.content, false)
                    msg_input.value = ''
                }else{
                    showToast("errorToast", msg.err)
                }
            },
            error: (e)=>{
                showToast('errorToast', e)
            }
        })
    }
}

$('#user_search').keyup(function(){
    const searchString= $(this).val()
    $('.found').remove()
    if(searchString !== ''){
        $.ajax({
            url: `/u/find`,
            dataType: 'json',
            method: 'post',
            data: {searchString},
    
            success: (data)=>{
                const serach_results= document.getElementById('serach_results')
                $('.nomatch').hide()
                data.matchedUsers.forEach(user => {
                    let result_item= `
                        <a onclick="open_profile('${user._id}')" class="found text-decoration-none d-flex justify-content-between align-items-center p-2">
                            <div class="d-flex align-items-center">
                                <img src="https://bootdey.com/img/Content/avatar/avatar1.png" width="40" height="40" class="rounded-circle me-2">
                                <h5>${user.full_name}</h5>
                            </div>
                        </a>
                    `
                    serach_results.innerHTML+= result_item
                });
            },
            error: (e)=> alert(e.message)
        })
    }
    $('.nomatch').show()
})

function open_profile(user){
    const chat_window= document.getElementById("chat-window")
    $.ajax({
        url: `/u/profile/${user}`,
        dataType: 'json',
        method: 'get',

        success: (data)=>{
            chat_window.innerHTML=`
                <div class="d-flex align-items-center flex-column">
                    <div class="profile-userpic">
                        <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="img-responsive" alt=""> </div>
                    <div class="text-center">
                        <h2 class="mt-5">
                            ${data.user.full_name}
                        </h2>
                        <h6 class="text-muted"> 
                            ${data.user.email} 
                        </h6>
                    </div>
                    ${
                        data.user._id == currentUid?
                        `<div class="mt-4 bg-primary p-2 text-white">
                            My Profile
                        </div>`: data.isFriend == 'yes'?
                        `<div class="mt-4">
                            <button type="button" f_id="${data.user._id}" f_name="${data.user.full_name}" 
                            onclick="open_chat(this)" class="friend btn btn-primary py-2 px-5 btn-sm">
                                Chat
                            </button>
                            <form class="d-inline" method="post" action="/friends/delete/${data.user._id}">
                                <button type="submit" class="btn btn-danger py-2 px-5 btn-sm">
                                    Unfriend
                                </button>
                            </form>
                        </div>`: data.isFriend == 'sent'?
                        `<div class="mt-4">
                            <form class="d-inline" method="post" action="/friends/delete/${data.user._id}">
                                <button type="submit" class="btn btn-secondary py-2 px-5 btn-sm">
                                    Cancel Request
                                </button>
                            </form>
                        </div>`: data.isFriend == 'pending'?
                        `<div class="mt-4">
                            <button type="button" user_id="${data.user._id}" onclick="acceptFriend(this)"
                                class="btn btn-success py-2 px-5 btn-sm">
                                Accept Request
                            </button>
                            <form class="d-inline" method="post" action="/friends/delete/${data.user._id}">
                                <button type="submit" class="btn btn-secondary py-2 px-5 btn-sm">
                                    Reject Request
                                </button>
                            </form>
                        </div>`: 
                        `<div class="mt-4">
                            <button type="button" user_id="${data.user._id}" onclick="send_frequest(this)"
                            class="btn btn-success py-2 px-5 btn-sm">
                                Add Friend
                            </button>
                        </div>`
                    }
                </div>
            `
        }
    })
}

function send_frequest(btn){
    const userId= $(btn).attr('user_id')

    $.ajax({
        url: `/friends/send/${userId}`,
        dataType: 'json',
        method: 'post',
        
        success: (data)=>{
            if(data.msg){
                showToast("friendToast", data.msg)
                socket.emit('sendFriendReq', {
                    receiver: userId, sender: data.sender
                })
                chat_window.innerHTML= default_main_window
            }else{
                showToast("errorToast", data.err)
            }

        },
        error: (e)=> console.log(e)
    })
}

function acceptFriend(btn){
    const userId= $(btn).attr('user_id')
    const friendsList= document.getElementById('friends_list')
    
    $.ajax({
        url: `/friends/accept/${userId}`,
        dataType: 'json',
        method: 'post',

        success: (data)=>{
            if(data.msg){
                socket.emit('acceptFriendReq', {
                    sender:data.sender , receiverName: data.receiverName , receiverId: data.receiverId
                })
                friendsList.innerHTML+=
                `
                    <li class="friend d-flex justify-content-between" onclick="open_chat(this)" f_id="${data.sender._id}" f_name="${data.sender.full_name}">
                        <div>
                        <img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="avatar">
                        <div class="about">
                            ${data.sender.full_name}
                        </div>
                        </div>
                        <div class="newMsgAlert bg-danger p-1"></div>
                    </li>
                `
                chat_window.innerHTML= default_main_window                
                showToast('friendToast', data.msg)
            }else{
                showToast("errorToast", data.err)
            }
        }
    })
}