let currentPage = 1;
let loading = false;

async function loadFilms(){
  if (loading) return; loading=true;
  const grid=document.getElementById('grid');
  const loadingEl=document.getElementById('loading');
  loadingEl.textContent='Загрузка…';
  try{
    const url=`https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=${currentPage}`;
    const resp=await fetch(url,{headers:{'X-API-KEY':KINOPOISK_API_KEY}});
    if(!resp.ok) throw new Error('API error');
    const data=await resp.json();
    const films=data.films||data.items||[];
    for(const f of films){
      const card=document.createElement('div');
      card.className='card';
      const title=f.nameRu||f.nameEn||'Без названия';
      card.innerHTML=`<img src="${f.posterUrlPreview||''}" alt="${title}"><div class="meta"><div class="title">${title}</div><div class="year">${f.year||''} ⭐${f.rating||''}</div></div>`;
      card.addEventListener('click',()=>openDetail(f.filmId||f.kinopoiskId,title));
      grid.appendChild(card);
    }
    currentPage++;
    if(films.length===0){ loadingEl.textContent='Больше фильмов нет'; } else { loadingEl.textContent=''; }
  }catch(e){console.error(e); loadingEl.textContent='Ошибка загрузки';}
  loading=false;
}

function openDetail(id,title){
  const modal=document.getElementById('detailModal');
  const content=document.getElementById('detailContent');
  content.innerHTML='<div class="muted">Загрузка...</div>';
  modal.classList.add('show');
  fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}`,{headers:{'X-API-KEY':KINOPOISK_API_KEY}})
    .then(r=>r.json()).then(data=>{
      const poster=data.posterUrl||'';
      const desc=data.description||'';
      const year=data.year||'';
      const rating=data.ratingKinopoisk||'';
      const genres=(data.genres||[]).map(g=>g.genre).join(', ');
      content.innerHTML=`<div class='detail'>
        <img src='${poster}' alt='${title}'>
        <div class='detail-info'>
          <h2>${title}</h2>
          <p><strong>Год:</strong> ${year}</p>
          <p><strong>Жанры:</strong> ${genres}</p>
          <p><strong>Рейтинг:</strong> ${rating}</p>
          <p>${desc}</p>
          <div class='detail-actions'>
            <button class='watch' onclick="openPlayerById(${id},'${title}')">Смотреть</button>
            <button class='together' onclick="createTogether(${id},'${title}')">Смотреть вместе</button>
            <button class='trailer' onclick="openTrailer(${id})">Трейлер</button>
          </div>
        </div>
      </div>`;
    });
}

function createTogether(id,title){ alert('Ссылка для совместного просмотра будет здесь.'); }
function openTrailer(id){ alert('Тут можно встроить трейлер через API.'); }

window.addEventListener('scroll',()=>{
  if(window.innerHeight+window.scrollY>=document.body.offsetHeight-200){ loadFilms(); }
});

window.addEventListener('DOMContentLoaded',()=>{
  loadFilms();
  document.getElementById('closeDetailBtn').addEventListener('click',()=>document.getElementById('detailModal').classList.remove('show'));
});
