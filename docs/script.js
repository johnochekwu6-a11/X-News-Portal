// ======= STORAGE =======
let users = JSON.parse(localStorage.getItem('users')) || [];
let articles = JSON.parse(localStorage.getItem('articles')) || [];
let loggedInUser = null;

// ======= NAVIGATION =======
function openPage(id){
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id==='home'){ displayArticles(); }
}

// ======= SIGNUP =======
function signupCreator(){
    let username = document.getElementById('creatorUsername').value.trim();
    let email = document.getElementById('creatorEmail').value.trim();
    let password = document.getElementById('creatorPassword').value;
    if(!username || !email || !password){ alert('All fields required'); return; }
    if(users.find(u=>u.email===email)){ alert('Email exists'); return; }
    users.push({username,email,password,creator:true,status:'pending',followers:[],likes:[],articles:[]});
    localStorage.setItem('users', JSON.stringify(users));
    loggedInUser = username;
    alert('Signed up! Waiting for admin approval.');
    document.getElementById('authorDropdown').style.display = 'none';
    openPage('home');
}

// ======= LOGIN =======
function loginUser(){
    let email = document.getElementById('loginEmail').value;
    let password = document.getElementById('loginPassword').value;
    let user = users.find(u => u.email===email && u.password===password);
    if(!user){ alert('Invalid credentials'); return; }
    loggedInUser = user.username;
    if(user.email==='maduekefelix76@gmail.com'){ openPage('adminDashboard'); setupAdminMenu(); }
    else if(user.creator && user.status==='active'){ 
        openPage('dashboard'); 
        document.getElementById('creatorName').innerText=user.username; 
        showTab('createTab'); 
        document.getElementById('authorDropdown').style.display='none'; 
        displayCreatorArticles(); 
    } else{ alert('Waiting for admin approval'); openPage('home'); }
}

// ======= DASHBOARD TABS =======
function showTab(tab){
    document.querySelectorAll('.tabContent').forEach(t => t.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
}

// ======= CREATE ARTICLE =======
function createArticle(){
    let title = document.getElementById('articleTitle').value.trim();
    let content = document.getElementById('articleContent').value.trim();
    if(!title || !content){ alert('Title & content required'); return; }
    let article = {title,content,author:loggedInUser,status:'pending',clicks:0,shares:0,comments:0,reach:0};
    articles.push(article);
    localStorage.setItem('articles',JSON.stringify(articles));
    alert('Article submitted! Waiting for approval.');
    document.getElementById('articleTitle').value=''; 
    document.getElementById('articleContent').value='';
    displayCreatorArticles();
}

// ======= DISPLAY ARTICLES =======
function displayArticles(){
    let container = document.getElementById('articlesSection');
    container.innerHTML = '';
    articles.filter(a=>a.status==='approved').forEach(a=>{
        let div = document.createElement('div');
        div.className = 'article-card';
        div.innerHTML=`<h3>${a.title}</h3><p>${a.content}</p><span>Author: ${a.author} | Reach: ${a.reach}</span>`;
        container.appendChild(div);
    });
}

// ======= CREATOR ARTICLES =======
function displayCreatorArticles(){
    let container=document.getElementById('creatorArticles');
    container.innerHTML='';
    articles.filter(a => a.author===loggedInUser).forEach(a=>{
        let div=document.createElement('div');
        div.className='article-card';
        div.innerHTML=`<h3>${a.title} - [${a.status}]</h3><p>${a.content}</p><span>Reach: ${a.reach}</span>`;
        container.appendChild(div);
    });
}

// ======= SEARCH =======
function searchArticles(){
    let q=document.getElementById('searchInput').value.toLowerCase();
    let container=document.getElementById('articlesSection');
    container.innerHTML='';
    articles.filter(a=>a.status==='approved' && a.author.toLowerCase().includes(q)).forEach(a=>{
        let div=document.createElement('div');
        div.className='article-card';
        div.innerHTML=`<h3>${a.title}</h3><p>${a.content}</p><span>Author: ${a.author} | Reach: ${a.reach}</span>`;
        container.appendChild(div);
    });
}

// ======= ADMIN MENU =======
function setupAdminMenu(){
    let menu=document.getElementById('adminMenu');
    menu.style.display='block';
    menu.innerHTML='';
    const sections=['Published','Pending','Rejected','Drafts','Authors','Monetization','Settings'];
    sections.forEach(sec=>{
        let btn=document.createElement('button');
        btn.innerText=sec;
        btn.onclick=()=>displayAdminSection(sec);
        menu.appendChild(btn);
    });
}
function toggleAdminMenu(){
    let menu=document.getElementById('adminMenu');
    menu.style.display=(menu.style.display==='block')?'none':'block';
}

// ======= ADMIN DISPLAY =======
function displayAdminSection(section){
    let content=document.getElementById('adminContent');
    content.innerHTML=`<h3>${section}</h3>`;
    if(section==='Pending'){
        articles.filter(a=>a.status==='pending').forEach((a,i)=>{
            let div=document.createElement('div');
            div.className='article-card';
            div.innerHTML=`<h4>${a.title} by ${a.author}</h4>
            <p>${a.content}</p>
            <p>Reach: ${a.reach}</p>
            <button onclick="approveArticle(${i})">Approve</button>
            <button onclick="rejectArticle(${i})">Reject</button>
            <input type="number" placeholder="Set reach" id="reach${i}" style="width:80px;">
            <button onclick="setReach(${i})">Update Reach</button>`;
            content.appendChild(div);
        });
    } else if(section==='Authors'){
        users.filter(u=>u.creator).forEach((u,i)=>{
            let div=document.createElement('div');
            div.className='article-card';
            div.innerHTML=`<p>${u.username} - Status: ${u.status}</p>
            ${u.status==='pending'?`<button onclick="approveAuthor(${i})">Approve Author</button>`:''}`;
            content.appendChild(div);
        });
    } else { content.innerHTML+='<p>Functionality coming soon for '+section+'</p>'; }
}

// ======= ADMIN FUNCTIONS =======
function approveArticle(i){ articles[i].status='approved'; localStorage.setItem('articles',JSON.stringify(articles)); displayAdminSection('Pending'); displayArticles(); }
function rejectArticle(i){ articles[i].status='rejected'; localStorage.setItem('articles',JSON.stringify(articles)); displayAdminSection('Pending'); displayCreatorArticles(); }
function setReach(i){ let val=parseInt(document.getElementById('reach'+i).value); if(!isNaN(val)){ articles[i].reach=val; localStorage.setItem('articles',JSON.stringify(articles)); displayAdminSection('Pending'); displayArticles(); } }
function approveAuthor(i){ users[i].status='active'; localStorage.setItem('users',JSON.stringify(users)); displayAdminSection('Authors'); alert(users[i].username+' is now an active author!'); }
