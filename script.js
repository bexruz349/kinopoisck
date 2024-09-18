// Инициализация переменной favs
let favs = JSON.parse(localStorage.getItem("favs")) || [];

// Обработка смены темы
let changeThemeBtn = document.querySelector(".themeChange");
let body = document.querySelector("body");

changeThemeBtn.addEventListener("click", changeTheme);

// Установка темы при загрузке страницы
if (localStorage.getItem("theme") === "dark") {
  changeThemeBtn.classList.add("darkTheme");
  body.classList.add("dark");
}

function changeTheme() {
  if (localStorage.getItem("theme") === "dark") {
    changeThemeBtn.classList.remove('darkTheme');
    body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    changeThemeBtn.classList.add('darkTheme');
    body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
}

// Обработка поиска фильма
let searchBtn = document.querySelector(".search button");
searchBtn.addEventListener("click", searchMovie);

let loader = document.querySelector('.loader');

// Обработка нажатия клавиши Enter
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchMovie();
  }
});

async function searchMovie() {
  loader.style.display = "block";

  let searchText = document.querySelector(".search input").value;
  console.log(searchText);

  try {
    let response = await sendRequest("https://www.omdbapi.com/", "GET", {
      "apikey": "e27bb7cc",
      "t": searchText
    });

    if (response.Response === "False") { 
      loader.style.display = "none";
      alert(response.Error);
    } else {
      let main = document.querySelector(".main");
      main.style.display = "block";
      
      let movieTitle = document.querySelector(".movieTitle h2");
      movieTitle.innerHTML = response.Title;

      let movieIMG = document.querySelector(".movieIMG");
      movieIMG.style.backgroundImage = `url(${response.Poster})`;

      let dataList = ["Actors", "Awards", "Country", "Director", "Genre", "Language", "Plot", "Released", "Runtime", "Type", "Writer", "imdbRating"];
      let movieInfo = document.querySelector(".movieInfo");
      movieInfo.innerHTML = "";

      dataList.forEach(param => {
        let value = response[param];
        let desc = `<div class="desc darkBg"> 
                      <div class="title">${param}</div> 
                      <div class="value">${value ? value : "N/A"}</div> 
                   </div>`;
        movieInfo.innerHTML += desc;
      });

      loader.style.display = "none";
      searchSimilarMovies(searchText);
    }
    console.log(response);
  } catch (error) {
    loader.style.display = "none";
    alert("Ошибка при выполнении запроса. Попробуйте позже.");
    console.error(error);
  }
}

// Поиск похожих фильмов
async function searchSimilarMovies(title) {
  try {
    let response = await sendRequest("https://www.omdbapi.com/", "GET", {
      "apikey": "e27bb7cc",
      "s": title
    });

    if (response.Response === "False") {
      document.querySelector(".similarMovieTitle h2").style.display = "none";
      document.querySelector(".similarMovie").style.display = "none";
    } else {
      const similarMovieTitle = document.querySelector(".similarMovieTitle h2");
      const similarMovie = document.querySelector(".similarMovie");

      if (similarMovieTitle) {
        similarMovieTitle.innerHTML = `Похожие фильмы: ${response.totalResults}`;
      }
      if (similarMovie) {
        similarMovie.style.display = "block"; // Показываем элемент, если был скрыт
      }

      showSimilarMovies(response.Search || []); // Обработка пустого массива, если нет результатов
      console.log(response);
    }
  } catch (error) {
    alert("Ошибка при выполнении запроса. Попробуйте позже.");
    console.error(error);
  }
}

function showSimilarMovies(movies) {
  let similarMovie = document.querySelector(".similarMovie");
  let similarMovieTitle = document.querySelector(".similarMovieTitle h2");
  similarMovie.innerHTML = ""; 
  similarMovieTitle.innerHTML = `Фильмы в избраном: ${favs.length}`;

  movies.forEach(movie => {
    const isFav = favs.some(fav => fav.imdbID === movie.imdbID);
    let favCheck = isFav ? "active" : "";

    similarMovie.innerHTML += 
    `<div class="similarMovieCard" style="background-image:url(${movie.Poster})">
      <div class="favStar ${favCheck}" data-title="${movie.Title}" data-poster="${movie.Poster}" data-imdbID="${movie.imdbID}"></div>
      <div class="similarMovieText">${movie.Title}</div>
    </div>`;
  });

  similarMovie.style.display = "grid";
  similarMovieTitle.style.display = "block";
  activateFavBtns();
}

function activateFavBtns() { 
  document.querySelectorAll(".favStar").forEach((elem) => { 
    elem.addEventListener("click", addToFav); 
  }); 
}

function addToFav(event) { 
  let favBtn = event.target;
  let title = favBtn.getAttribute("data-title"); 
  let poster = favBtn.getAttribute("data-poster"); 
  let imdbID = favBtn.getAttribute("data-imdbID"); 

  const index = favs.findIndex(obj => obj.imdbID === imdbID);

  if (index < 0) {
    let fav = {title, poster, imdbID};
    favs.push(fav);
    localStorage.setItem("favs", JSON.stringify(favs));
    favBtn.classList.add("active");
  } else {
    favs.splice(index, 1);
    localStorage.setItem("favs", JSON.stringify(favs));
    favBtn.classList.remove("active");
  }
}

async function sendRequest(url, method, data) {
  if (method === "POST") {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    let responseData = await response.json();
    return responseData;
  } else if (method === "GET") {
    url = url + "?" + new URLSearchParams(data);
    let response = await fetch(url, {
      method: "GET"
    });

    let responseData = await response.json();
    return responseData;
  }
}

function showFavs() {
  let similarMovie = document.querySelector(".similarMovie");
  let similarMovieTitle = document.querySelector(".similarMovieTitle h2");
  let similarMovieContainer = document.querySelector(".similarMovieConteiner");

  similarMovie.innerHTML = ""; 
  similarMovieTitle.innerHTML = `Фильмы в избраном: ${favs.length}`;

  favs.forEach((movie) => {
    let favCheck = "active"; // Все фильмы здесь избранные
    similarMovie.innerHTML += `
      <div class="similarMovieCard" style="background-image:url(${movie.poster})">
        <div class="favStar ${favCheck}" data-title="${movie.title}" data-poster="${movie.poster}" data-imdbID="${movie.imdbID}"></div>
        <div class="similarMovieText">${movie.title}</div>
      </div>`;
  });

  similarMovieContainer.style.display = "grid";
  similarMovieTitle.style.display = "block";

  activateFavBtns();
}
