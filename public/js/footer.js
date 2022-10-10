const createFooter = () => {
    let footer = document.querySelector('footer');

    footer.innerHTML = `
    <div class="footer-content">
    <img src="../img/logo.png" class="logo" alt="">
    <div class="footer-ul-container">
        <ul class="category">
            <li class="category-title">local</li>
            <li><a href="/seller.html" class="footer-link">painted</a></li>
            <li><a href="/seller.html" class="footer-link">drawn</a></li>
            <li><a href="/seller.html" class="footer-link">crafted</a></li>
        </ul>

        <ul class="category">
            <li class="category-title">recycled</li>
            <li><a href="/seller.html" class="footer-link">painted</a></li>
            <li><a href="/seller.html" class="footer-link">drawn</a></li>
            <li><a href="/seller.html" class="footer-link">crafted</a></li>
        </ul>

        <ul class="category">
            <li class="category-title">sculpted</li>
            <li><a href="/seller.html" class="footer-link">painted</a></li>
            <li><a href="/seller.html" class="footer-link">drawn</a></li>
            <li><a href="/seller.html" class="footer-link">crafted</a></li>
        </ul>
    </div>
</div>
<p class="footer-title">about us</p>
<p class="info">blah blah blah blah blah blahblah blah blahblah blah blahblah blah blahblah blah blahblah blah blah
        blah blah blahblah blah blahblah blah blahblah blah blahblah blah blahblah blah blahblah blah blahblah blah blah
        blah blah blahblah blah blahblah blah blahblah blah blahblah blah blahblah blah blahblah blah blahblah blah blah
        blah blah blahblah blah blahblah blah blahblah blah blahblah blah blahblah blah blahblah blah blahblah blah blah
</p>
<p class="info">support emails - awarri74@gmail.com,
    dawarri@usiu.ac.ke</p>
<p class="info">phone 0768773626, 08066739352</p>

<div class="footer-social-container">
    <div>
        <a href="#" class="social-link">terms & services</a>
        <a href="#" class="social-link">privacy page</a>
    </div>
    <div>
        <a href="https://twitter.com/awarridavid" class="social-link">Twitter</a>
        <a href="https://www.facebook.com/David.Awarri.10" class="social-link">Facebook</a>
    </div>
</div>

<p class="footer-credit">ARTHUB, Best online art store</p>
    `;
}

createFooter();