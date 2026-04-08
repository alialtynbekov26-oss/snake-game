const cartCountEl = document.getElementById("cartCount");
const buyButtons = document.querySelectorAll(".buy-btn");
const revealElements = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".nav-links a");

let cartCount = 0;

buyButtons.forEach((button) => {
    button.addEventListener("click", () => {
        cartCount += 1;
        cartCountEl.textContent = String(cartCount);

        button.textContent = "Кошулду!";
        button.disabled = true;

        setTimeout(() => {
            button.textContent = "Сатып алуу";
            button.disabled = false;
        }, 900);
    });
});

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px"
    }
);

revealElements.forEach((el) => revealObserver.observe(el));

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.forEach((item) => item.classList.remove("active-link"));
        link.classList.add("active-link");
    });
});
