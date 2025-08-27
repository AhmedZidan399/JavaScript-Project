// go top click

window.onscroll = function () {
     // go to top
     if (scrollY > 400) {
          document.querySelector(".go-top").classList.remove("hidden");
          document.querySelector(".go-top").style.animation =
               "go-top-animation 1s ease-in-out forwards";
     } else {
          document.querySelector(".go-top").classList.add("hidden");
     }
};

document.querySelector(".go-top").onclick = function () {
     document.documentElement.scrollTo({
          top: 0,
          behavior: "smooth",
     });
};