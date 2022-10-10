window.onload = () => {
    if(!sessionStorage.user){
        location.replace('/login');
    }

    if(location.search.includes('payment=done')){
        let items = [];
        localStorage.setItem('cart', JSON.stringify(items));
        showAlert("Order Placed Successfully");
    }

    if(location.search.includes('payment_fail=true')){
        showAlert("Payment failed, please try again");
    }
}

const placeOrderBtn = document.querySelector('.place-order-btn');
placeOrderBtn.addEventListener('click', () => {
    let address = getAddress();

    if(address.address.length){
        fetch('/order', {
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify({
                items: JSON.parse(localStorage.getItem('cart')),
                order: JSON.parse(localStorage.cart),
                email: JSON.parse(sessionStorage.user).email,
                address: address,
            })
        })
        .then(res => res.json())
        .then( url => {
            location.href = url;
        })
        .catch(err => console.log(err))
    }
})

const getAddress = () => {
    //validation
    let address = document.querySelector('#address').value;
    let street = document.querySelector('#street').value;
    let city = document.querySelector('#city').value;
    let county = document.querySelector('#county').value;
    let zipcode = document.querySelector('#zipcode').value;
    let landmark = document.querySelector('#landmark').value;

    if(!address.length || !street.length || !city.length || !county.length || !zipcode.length || !landmark.length){
        return showAlert('fill all inputs');
    } else{
        return { address, street, city, county, zipcode, landmark };
    }
}