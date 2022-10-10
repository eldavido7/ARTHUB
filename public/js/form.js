//redirect to homepage if user logs in
window.onload = () => {
    if(sessionStorage.user) {
        user = JSON.parse(sessionStorage.user);
        if(compareToken(user.authToken, user.email)){
            location.replace('/');
        }
    }
}

const loader = document.querySelector('.loader');

// select inputs
const submitBtn = document.querySelector('.submit-btn');
const name = document.querySelector('#name') || null;
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const number = document.querySelector('#number') || null;
const tac = document.querySelector('#terms-and-cond') || null;
const notification = document.querySelector('#notification') || null;

submitBtn.addEventListener('click', () => {
    if(name != null){ // signup page
        if(name.value.length < 3){
            showAlert('name must be at least 3 letters long');
        } else if(!email.value.length){
            showAlert('enter your email');
        } else if(password.value.length < 8){
            showAlert('password should be at least 8 characters long');
        } else if(!number.value.length){
            showAlert('enter your phone number');
        } else if(!Number(number.value) || number.value.length < 10){
            showAlert('invalid number, should be at least 10 characters long');
        } else if(!tac.checked){
            showAlert('you must agree to t&c to continue');
        } else{
            //submit form
            loader.style.display = 'block';
            sendData('/signup', {
                name: name.value,
                email: email.value,
                password: password.value,
                number: number.value,
                tac: tac.checked,
                notification: notification.checked,
                seller: false
            })
        }
    } else{
        // login page
        if(!email.value.length || !password.value.length){
            showAlert('fill all inputs before log in');
        } else{
            loader.style.display = 'block';
            sendData('/login', {
                email: email.value,
                password: password.value,
            })
        }
    }
})

