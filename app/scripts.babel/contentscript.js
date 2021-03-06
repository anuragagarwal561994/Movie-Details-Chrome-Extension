'use strict';

(function () {
  var shows = getElements();
  for (var i = 0, length = shows.length; i < length; i++) {
    fetchAndRender(shows[i]);
  }

  function getElements() {
    return document.getElementsByClassName('caption');
  }

  function getTitle(element) {
    return element.innerText;
  }

  function fetchAndRender(element) {
    var title = getTitle(element);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `http://www.omdbapi.com/?t=${title}`, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        if (response.Response === 'True') {
          renderElement(element, response);
          element.onmouseover = (e) => {
            var bodyElement = document.body;
            var popupElement = popUp(response);
            var elementPosition = getPosition(e.currentTarget);
            var documentElement = document.documentElement || document.body.parentNode || document.body;
            var scrollTop = window.pageYOffset || documentElement.scrollTop;
            var previousPopup = document.getElementById('mdb_balloon');

            popupElement.style.top = `${elementPosition.y + scrollTop + element.offsetHeight + 10}px`;
            popupElement.style.left = `${elementPosition.x}px`;
            if (previousPopup) {
              bodyElement.removeChild(previousPopup);
            }
            bodyElement.appendChild(popupElement);
          };
        }
      }
    };
    xhr.send();
  }

  function renderElement(element, response) {
    element.innerText += ` (IMDB: ${response.imdbRating} / 10)`;
  }

  function popUp(response) {
    var popup = document.createElement('div');
    var closeImg = document.createElement('img');
    var contentElement = document.createElement('div');
    var movieDetails = document.createElement('div');

    popup.id = 'mdb_balloon';
    contentElement.id = 'mdb_balloon_content';

    closeImg.src = chrome.extension.getURL('images/close.png');
    closeImg.title = 'Close';
    closeImg.id = 'mdb_balloon_close';
    closeImg.onclick = () => {
      document.body.removeChild(popup);
    };
    contentElement.appendChild(closeImg);

    movieDetails.id = 'mdb_balloon_details';
    if (response.Actors) {
      movieDetails.appendChild(popupTextElement(`<b>Actors</b>: ${response.Actors}`));
    }
    if (response.Writer) {
      movieDetails.appendChild(popupTextElement(`<b>Writer</b>: ${response.Writer}`));
    }
    if (response.Awards) {
      movieDetails.appendChild(popupTextElement(`<b>Awards</b>: ${response.Awards}`));
    }
    if (response.Genre) {
      movieDetails.appendChild(popupTextElement(`<b>Genre</b>: ${response.Genre}`));
    }
    if (response.Plot) {
      movieDetails.appendChild(popupTextElement(`${response.Plot}`));
    }
    if (response.imdbID) {
      movieDetails.appendChild(
        popupTextElement(`<a href='http://www.imdb.com/title/${response.imdbID}/' target="_blank">More</a>`)
      );
    }
    contentElement.appendChild(movieDetails);

    popup.appendChild(contentElement);
    return popup;
  }

  function popupTextElement(html) {
    var element = document.createElement('div');
    element.innerHTML = html;
    return element;
  }

  // Helper function to get an element's exact position
  function getPosition(el) {
    var xPos = 0;
    var yPos = 0;

    while (el) {
      if (el.tagName == 'BODY') {
        // deal with browser quirks with body/window/document and page scroll
        var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        var yScroll = el.scrollTop || document.documentElement.scrollTop;

        xPos += (el.offsetLeft - xScroll + el.clientLeft);
        yPos += (el.offsetTop - yScroll + el.clientTop);
      } else {
        // for all other non-BODY elements
        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }

      el = el.offsetParent;
    }
    return {
      x: xPos,
      y: yPos
    };
  }
})();
