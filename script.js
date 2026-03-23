const API = "http://lmpss3.dev.spsejecna.net/procedure.php";

async function nactiUzivatele() {
    const response = await fetch(API + "?cmd=getPeopleList");
    const data = await response.json();

    const sekce = document.getElementById("uzivateleSekce");
    sekce.innerHTML = "";

    for (const key in data) {
        const uzivatel = data[key];

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "option";
        input.value = uzivatel.ID;
        input.id = "user" + uzivatel.ID;

        const label = document.createElement("label");
        label.htmlFor = "user" + uzivatel.ID;
        label.textContent = uzivatel.name;

        input.addEventListener("change", function () {
            localStorage.setItem("lastUser", this.value);
            setCookie("lastUser", this.value, 30);
        });

        sekce.appendChild(input);
        sekce.appendChild(label);
    }

    const lastUser = localStorage.getItem("lastUser") || getCookie("lastUser");
    if (lastUser) {
        const radio = document.querySelector('input[name="option"][value="' + lastUser + '"]');
        if (radio) radio.checked = true;
    }
}

async function nactiNapoje() {
    const response = await fetch(API + "?cmd=getTypesList");
    const data = await response.json();

    const telo = document.getElementById("napojeTelo");
    telo.innerHTML = "";

    for (const key in data) {
        const napoj = data[key];

        const radek = document.createElement("tr");
        radek.innerHTML = `
                    <td>${napoj.typ}</td>
                    <td><input type="number" id="drink_${napoj.ID}" value="0" min="0" max="10"></td>
                `;
        telo.appendChild(radek);
    }
}

function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/";
}

function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
}

document.getElementById("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) {
        alert("Vyber prosím uživatele!");
        return;
    }

    const drinksInputy = document.querySelectorAll('#napojeTelo input[type="number"]');
    const drinks = [];
    drinksInputy.forEach(function (input) {
        const id = input.id.replace("drink_", "");
        const radek = input.closest("tr");
        const nazev = radek.querySelector("td").textContent;
        drinks.push({
            type: nazev,
            value: parseInt(input.value)
        });
    });

    const payload = {
        user: selected.value,
        drinks: drinks
    };

    console.log("Odesílám JSON:", JSON.stringify(payload, null, 2));

    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.textContent = "Odesílám…";

    try {
        const response = await fetch(API + "?cmd=saveDrinks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("HTTP " + response.status);
        alert("Záznam byl uložen!");

        drinksInputy.forEach(function (input) { input.value = 0; });

    } catch (err) {
        console.error(err);
        alert("Odeslání selhalo! Zkontroluj konzoli (F12).");
    } finally {
        btn.disabled = false;
        btn.textContent = "Odeslat záznam";
    }
});

async function init() {
    try {
        await Promise.all([nactiUzivatele(), nactiNapoje()]);
        document.getElementById("submitBtn").disabled = false;
    } catch (err) {
        console.error("Chyba při načítání dat:", err);
        alert("Nepodařilo se načíst data z API!");
    }
}

init();