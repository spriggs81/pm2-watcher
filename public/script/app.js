
const app = {}

app.bindButton = () => {
   if(document.querySelector(".menu")){
      const menus = document.querySelectorAll(".menu");
      for(let i = 0; i < menus.length; i++){
         menus[i].addEventListener("click",(e) => {
            console.log(e);
            const id = e.target.id;
            if(id === 'createApp'){
               window.location = '/app/create';n
            } else if(id === 'editApp'){
                window.location = '/app/edit';
            } else {
               window.location = '/';
            }
         });
      }
   }
};

app.formButton = () => {
   if(document.querySelector("form")){
      const forms = document.querySelectorAll("form");
      for(let i = 0; i < forms.length; i++){
         forms[i].addEventListener('submit',(e) => {
            e.preventDefault();
            const hn = document.querySelector('input[name="app[hostName]"]');
            const pt = document.querySelector('input[name="app[port]"]');
            const se = document.querySelector('select[name="app[secure]"]');
            const fm = document.querySelector('input[name="app[from]"]');
            const sr = document.querySelector('input[name="app[sender]"]');
            const ur = document.querySelector('input[name="app[user]"]');
            const pw = document.querySelector('input[name="app[password]"]');
            const dg = document.querySelector('select[name="app[debugging]"]');
            const fD = document.querySelector('input[name="app[failedDelays]"]');
            const pD = document.querySelector('input[name="app[passedDelays]"]');
            console.log(document.querySelector('input[name="app[debugging]"]'));
            console.log(dg);
            console.log(document.querySelector("form"));
            const hostName = typeof(hn.value) == 'string' && hn.value.trim().length > 0 ? hn.value : false;
            const port = typeof(Number(pt.value)) == 'number' && pt.value > 0 ? pt.value : false;
            const secure = typeof(se.value) == 'string' && se.value.trim().length > 0 ? se.value.trim() : false;
            const from = typeof(fm.value) == 'string' && fm.value.trim().length > 0 ? fm.value.trim() : false;
            const sender = typeof(sr.value) == 'string' && sr.value.trim().length > 0 ? sr.value.trim() : false;
            const user = typeof(ur.value) == 'string' && ur.value.trim().length > 0 ? ur.value.trim() : false;
            const password = typeof(pw.value) == 'string' && pw.value.trim().length > 0 ? pw.value.trim() : false;
            const debugging = typeof(dg.value) == 'string' && dg.value.trim().length > 0 ? dg.value.trim() : false;
            const failedDelays = typeof(Number(fD.value)) == 'number' && Number(fD.value) > 0 ? fD.value : false;
            const passedDelays = typeof(Number(pD.value)) == 'number' && Number(pD.value) > 0 ? pD.value : false;
            if(hostName && port && secure && from && sender && user && password && debugging && failedDelays && passedDelays){
               document.appSettings.submit();
               // window.location = '/';
            } else {
               alert("You are missing information!");
            }
         });
      }
   }
}

app.init = () => {
   app.bindButton();
   app.formButton();
};

window.onload = app.init();
