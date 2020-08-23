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
            const booleanArry = [true,false];
            const hn = document.querySelector('input[name="mail[hostName]"]');
            const pt = document.querySelector('input[name="mail[port]"]');
            const se = document.querySelector('select[name="mail[secure]"]');
            const fm = document.querySelector('input[name="mail[from]"]');
            const sr = document.querySelector('input[name="mail[sender]"]');
            const ur = document.querySelector('input[name="mail[user]"]');
            const pw = document.querySelector('input[name="mail[password]"]');
            const dg = document.querySelector('select[name="app[debugging]"]');
            const fD = document.querySelector('input[name="app[failedDelays]"]');
            const pD = document.querySelector('input[name="app[passedDelays]"]');
            const aL = document.querySelector('select[name="app[allowLogs]"]');
            const hostName = typeof(hn.value) == 'string' && hn.value.trim().length > 0 ? hn.value : false;
            const port = typeof(Number(pt.value)) == 'number' && pt.value > 0 ? pt.value : false;
            const secure = se.value == 'true' ? true : false;
            const from = typeof(fm.value) == 'string' && fm.value.trim().length > 0 ? fm.value.trim() : false;
            const sender = typeof(sr.value) == 'string' && sr.value.trim().length > 0 ? sr.value.trim() : false;
            const user = typeof(ur.value) == 'string' && ur.value.trim().length > 0 ? ur.value.trim() : false;
            let password = typeof(pw.value) == 'string' && pw.value.trim().length > 0 ? pw.value.trim() : false;
            const debugging = dg.value == 'true' ? true : false;
            const failedDelays = typeof(Number(fD.value)) == 'number' && Number(fD.value) > 0 ? fD.value : false;
            const passedDelays = typeof(Number(pD.value)) == 'number' && Number(pD.value) > 0 ? pD.value : false;
            const allowLogs = aL.value == 'true' ? true : false;;
            if(document.querySelector('form').action.indexOf('PUT') > -1 == true){
               console.log("password changed!");
               password = "oldPassword";
            }
            if(hostName && port && booleanArry.indexOf(secure) > -1 && from && sender && user && booleanArry.indexOf(debugging) > -1 && failedDelays && passedDelays && booleanArry.indexOf(allowLogs) > -1){
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
