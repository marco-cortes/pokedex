const type = (type) => {
    return "<p class='type " + type + "'>" + type + "</p>";
}

const move = (move) => {
    return "<li class='move'>" + move + "</li>";
}

const setData = (pokemon) => {
    document.getElementById("name").innerText = pokemon.name;
    let number = pokemon.number.toString();
    if (number.length == 1) {
        number = "#00" + number;
    } else if (number.length == 2) {
        number = "#0" + number;
    } else {
        number = "#" + number;
    }
    document.getElementById("number").innerText = number;
    document.getElementById("img").src = pokemon.img;
    document.getElementById("types").innerHTML = pokemon.type.map(typ => type(typ)).join(" ");
    document.getElementById("weight").innerText = pokemon.weight;
    document.getElementById("height").innerText = pokemon.height;
    document.getElementById("moves").innerHTML = pokemon.moves.map(mov => move(mov)).join(" ");
    

    document.getElementById("hp").innerText = format(pokemon.hp.toString());
    document.getElementById("atk").innerText = format(pokemon.attack.toString());
    document.getElementById("def").innerText = format(pokemon.defense.toString());
    document.getElementById("satk").innerText = format(pokemon.special_attack.toString());
    document.getElementById("sdef").innerText = format(pokemon.special_defense.toString());
    document.getElementById("spd").innerText = format(pokemon.speed.toString());


    document.getElementById("card").classList = "card " + pokemon.type[0]
    document.getElementById("pokemon").classList = pokemon.type[0];
    document.getElementById("button").classList = pokemon.type[0];
    document.getElementById("body").classList = pokemon.type[0];
    document.getElementById("err").innerText = "";
    document.getElementById("pokemon").value = "";

    let progress = document.getElementsByClassName("progress");
    let bars = document.getElementsByClassName("bar");

    for (let i = 0; i < progress.length; i++) {
        bars[i].style.width = (parseInt(progress[i].innerText)/2) + "%";
    }
}

const format = (number) => {
    if(number.length == 1) {
        return "00" + number;
    } else if(number.length == 2) {
        return "0" + number;
    } else {
        return number;
    }
}

const getData = async () => {
    try {
        let pokesearch = document.getElementById("pokemon").value;
        const data = await fetch('https://pokeapi.co/api/v2/pokemon/' + pokesearch.toLowerCase());
        await data.json().then(pokemon => {
            let newPokemon = {
                name: pokemon.name,
                number: pokemon.id,
                img: pokemon.sprites.front_default,
                type: pokemon.types.map(typ => typ.type.name),
                weight: pokemon.weight / 10 + " kg",
                height: pokemon.height / 10 + " m",
                moves: pokemon.abilities.map(ab => ab.ability.name),
                hp: pokemon.stats[0].base_stat,
                attack: pokemon.stats[1].base_stat,
                defense: pokemon.stats[2].base_stat,
                special_attack: pokemon.stats[3].base_stat,
                special_defense: pokemon.stats[4].base_stat,
                speed: pokemon.stats[5].base_stat,
            }
            setData(newPokemon);
        }).catch(err => {
            console.log(err);
            document.getElementById("err").innerText = "Pokemon not found";
        })
    } catch (err) {
        console.log(err);
    }
}

document.getElementById("pokemon").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        getData();
    }
})

const init = async () => {
    try {
        const data = await fetch('https://pokeapi.co/api/v2/pokemon/1');
        await data.json().then(pokemon => {
            let newPokemon = {
                name: pokemon.name,
                number: pokemon.id,
                img: pokemon.sprites.front_default,
                type: pokemon.types.map(typ => typ.type.name),
                weight: pokemon.weight / 10 + " kg",
                height: pokemon.height / 10 + " m",
                moves: pokemon.abilities.map(ab => ab.ability.name),
                hp: pokemon.stats[0].base_stat,
                attack: pokemon.stats[1].base_stat,
                defense: pokemon.stats[2].base_stat,
                special_attack: pokemon.stats[3].base_stat,
                special_defense: pokemon.stats[4].base_stat,
                speed: pokemon.stats[5].base_stat,
            }
            setData(newPokemon);
        }).catch(err => {
            console.log(err);
            document.getElementById("err").innerText = "Pokemon not found";
        })
    } catch (err) {
        console.log(err);
    }
}

init();