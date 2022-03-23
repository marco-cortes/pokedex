//COMPONENTS

//ICONS DIR
let icons = "./assets/types/Icon_";

//POKEMON IMAGE
const pokemonImage = (pokemon) => {
    return '<img src="' + pokemon.image + '" alt="' + pokemon.name + '" class="pokemon-main-img" />'
}

const type = (type) => {
    return (
        '<li class="pokemon-type ' + type + '"' + '> <img src="' + icons + type + '.webp" class="pokemon-type-icon" alt="si" /> ' + type + '</li>'
    );
}

const ability = (ability) => {
    return '<li class="pokemon-abilitie">' + ability.toUpperCase() + '</li>';
}

const stat = (stat) => {
    return (
        '<li class="pokemon-stat">' +
            '<span class="pokemon-stat-value">' + stat.baseStat + '</span>' +
            '<div class="bar">' +
                '<span class="progress" style="width:' + stat.baseStat / 2 + '%;"></span>' +
            '</div>' +
        '</li>'
    );
}

const evolution = (base, evolution) => {
    return(
        '<li class="pokemon-evolution">' +
            '<div class="pokemon-evolution-item">' +
                '<span class="pokemon-evolution-name">'+base.name+'</span>' +
                '<img src="'+base.image+'" alt="'+base.name+'" class="pokemon-evolution-img" />' +
                '<div class="pokemon-evolution-types">' +
                    base.types.map((type) => {
                        return ('<img src="'+icons + type +'.webp" class="pokemon-evolution-icon" alt="'+type+'" />')
                    }) +
                    
                '</div>' +
            '</div>' +
            '<i class="fa-solid fa-arrow-right-long arrow"></i>' +
            '<div class="pokemon-evolution-item">' +
                '<span class="pokemon-evolution-name">'+evolution.name+'</span>' +
                '<img src="'+evolution.image+'" alt="'+evolution.name+'" class="pokemon-evolution-img" />' +
                '<div class="pokemon-evolution-types">' +
                    evolution.types.map((type) => {
                        return ('<img src="'+icons + type + '.webp" class="pokemon-evolution-icon" alt="'+type+'" />')
                    }) +
                '</div>' +
            '</div>' +
        '</li>'
    )
}

const listItem = (pokemon) => {
    const { id, name, image } = pokemon;
    return (
        '<div class="list-item" onclick="selectPokemon(id)" id="' + id + '">' +
            '<h3 class="list-title">' + name + '</h3>' +
            '<div class="list-div">' +
                '<span class="list-num">' + formatNumber(id) + '</span>' +
                '<img class="list-img" src="' + image + '" alt="' + name + '" />' +
            '</div>' +
        '</div>'
    )
}

const formatNumber = (number) => {
    number = number.toString();
    if (number.length >= 3) {
        return "#" + number;
    } else if (number.length === 2) {
        return "#0" + number;
    } else if (number.length === 1) {
        return "#00" + number;
    }
}

const selectPokemon = async (id) => {
    const pokemon = await fetchFullPokemon(id);
    setData(pokemon);
}

const submitPokemon = async (e) => {
    e.preventDefault();
    const input = document.getElementById("input");
    const pokemon = await fetchFullPokemon(input.value);
    setData(pokemon);
    document.getElementById(pokemon.id).scrollIntoView();
}

const setData = (pokemon) => {
    if (!pokemon.evolutions)
        document.getElementById("card-button-3").style.display = "none";
    else
        document.getElementById("card-button-3").style.display = "block";

    document.getElementById("pokemon-img").innerHTML = pokemonImage(pokemon);
    document.getElementById("pokemon-id").innerHTML = formatNumber(pokemon.id);
    document.getElementById("pokemon-name").innerHTML = pokemon.name;
    document.getElementById("pokemon-alias").innerHTML = "The " + pokemon.alias;
    document.getElementById("pokemon-types").innerHTML = pokemon.types.map((t) => type(t)).join("");
    document.getElementById("pokemon-weight").innerHTML = pokemon.weight + " kg";
    document.getElementById("pokemon-height").innerHTML = pokemon.height + " m";
    document.getElementById("pokemon-stats").innerHTML = pokemon.stats.map((s) => stat(s)).join("");
    document.getElementById("pokemon-abilities").innerHTML = pokemon.abilities.map((a) => ability(a)).join("");

    if (pokemon.evolutions) {
        document.getElementById("pokemon-evolutions-1").innerHTML = pokemon.evolutions.firstEvolution.map((e) => evolution(pokemon.evolutions.base, e)).join("");
        if(pokemon.evolutions.secondEvolution)
            document.getElementById("pokemon-evolutions-2").innerHTML = pokemon.evolutions.secondEvolution.map((e) => evolution(pokemon.evolutions.firstEvolution[0], e)).join("");
        else 
            document.getElementById("pokemon-evolutions-2").innerHTML = "";
    }



    document.getElementById("body").classList = pokemon.types[0];
    const items = document.getElementsByClassName("list-item-selected");
    if (items.length > 0)
        items[0].classList.remove("list-item-selected");
    document.getElementById(pokemon.id).classList.add("list-item-selected");

    document.getElementById("card").classList = "pokemon-card animate__animated animate__fadeIn";
    document.getElementById("poke-img").classList = "animate__animated animate__fadeIn";
    document.getElementById("pokemon").classList.add("active");

    resetCards();
}

const fetchFullPokemon = async (id) => {

    if (document.getElementById("card")) {
        document.getElementById("card").classList = "pokemon-card";
        document.getElementById("poke-img").classList = "";
    }

    //FETCH POKEMON
    const { pokemon, pokemonFinal } = await fetchPokemon(id);

    //FETCH ABOUT AND ALIAS
    const specie = await fetch(pokemon.species.url);
    const specieData = await specie.json();

    //GET AND FORMAT ABOUT AND ALIAS
    let alias = "";
    specieData.genera.map((genus) => genus.language.name === "en" ? alias = genus.genus : null);
    pokemonFinal.alias = alias;
    specieData.flavor_text_entries.map((flavor) => flavor.language.name === "en" ? pokemonFinal.description = flavor.flavor_text.split("").join(" ") : null);

    //FETCH EVOLUTIONS
    const evolutions = await fetch(specieData.evolution_chain.url);
    const evolutionsData = await evolutions.json();
    let base = evolutionsData.chain.species.name;
    if (evolutionsData.chain.evolves_to.length > 0) {
        let secondEvolution;
        let firstEvolution = evolutionsData.chain.evolves_to.map((evolution) => {
            if (evolution.evolves_to.length > 0) {
                secondEvolution = evolution.evolves_to.map((e) => {
                    return {
                        name: e.species.name,
                    }
                })
            }
            return {
                name: evolution.species.name,
            };
        });
        pokemonFinal.evolutions = {
            base,
            firstEvolution: firstEvolution,
            secondEvolution: secondEvolution,
        }
    }

    //GET AND FORMAT EVOLUTIONS
    if (pokemonFinal.evolutions) {
        const { pokemonEvolution } = await fetchPokemon(pokemonFinal.evolutions.base);
        pokemonFinal.evolutions.base = pokemonEvolution;
        const evolutions1F = pokemonFinal.evolutions.firstEvolution.map(async (evolution) => {
            const { pokemonEvolution } = await fetchPokemon(evolution.name);
            return pokemonEvolution;
        })
        pokemonFinal.evolutions.firstEvolution = await Promise.all(evolutions1F);
        if (pokemonFinal.evolutions.secondEvolution) {
            const evolutions2F = pokemonFinal.evolutions.secondEvolution.map(async (evolution) => {
                const { pokemonEvolution } = await fetchPokemon(evolution.name);
                return pokemonEvolution;
            })
            pokemonFinal.evolutions.secondEvolution = await Promise.all(evolutions2F);
        }
    }
    return pokemonFinal;
}


const fetchPokemon = async (id) => {
    try {
        const data = await fetch('https://pokeapi.co/api/v2/pokemon/' + id.toLowerCase());
        const pokemon = await data.json();

        const pokemonFinal = {
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.sprites.other.home.front_default,
            types: pokemon.types.map((type) => type.type.name),
            weight: pokemon.weight / 10,
            height: pokemon.height / 10,
            stats: pokemon.stats.map((stat) => {
                return {
                    baseStat: stat.base_stat,
                };
            }),
            abilities: pokemon.abilities.map((ability) => ability.ability.name),
        };

        //CORRECCIÓN DE IMÁGENES
        pokemonFinal.image = repairImgPokemon(pokemonFinal.id, pokemonFinal.image);

        const pokemonEvolution = {
            id: pokemonFinal.id,
            name: pokemonFinal.name,
            image: pokemonFinal.image,
            types: pokemonFinal.types
        }

        return { pokemon, pokemonFinal, pokemonEvolution };

    } catch (err) {
        console.log(err);
    }
}


const fetchList = async () => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1126`);
    const pokemonList = await res.json();
    let pokemonListFinal = pokemonList.results.map((pokemon) => {
        return {
            id: pokemon.url.split('/')[6],
            name: pokemon.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.url.split('/')[6]}.png`,
        }
    });

    //CORRECCIÓN DE IMÁGENES
    pokemonListFinal = repairImgList(pokemonListFinal);
    return pokemonListFinal;
}


const repairImgPokemon = (id, image) => {
    switch (id) {
        case 718: case 10093: case 10128: case 10129: case 10146: case 10149: case 10150:
        case 10151: case 10153: case 10154:
            console.log(id);
            return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + id + ".png";
        case 10061: case 10080: case 10081: case 10082: case 10083: case 10084: case 10085:
        case 10116: case 10121: case 10122: case 10130: case 10131: case 10132: case 10133: case 10134: case 10135: case 10144: case 10145: case 10228:
            return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png";
        case 10158:
            return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/25.png";
        case 10159:
            return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/133.png";
        case 10181:
            return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/718-10.png";
        default:
            return image;
    }
}


const repairImgList = (pokemonListFinal) => {
    pokemonListFinal[717].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/718.png";

    pokemonListFinal[958].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10061.png";
    pokemonListFinal[977].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10080.png";
    pokemonListFinal[978].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10081.png";

    pokemonListFinal[979].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10082.png";
    pokemonListFinal[980].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10083.png";
    pokemonListFinal[981].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10084.png";
    pokemonListFinal[982].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10085.png";

    pokemonListFinal[990].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10093.png";

    pokemonListFinal[1013].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10116.png";

    pokemonListFinal[1018].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10121.png";
    pokemonListFinal[1019].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10122.png";

    pokemonListFinal[1025].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10128.png";

    pokemonListFinal[1026].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10129.png";
    pokemonListFinal[1027].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10130.png";
    pokemonListFinal[1028].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10131.png";
    pokemonListFinal[1029].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10132.png";
    pokemonListFinal[1030].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10133.png";
    pokemonListFinal[1031].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10134.png";
    pokemonListFinal[1032].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10135.png";

    pokemonListFinal[1041].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10144.png";
    pokemonListFinal[1042].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10145.png";
    pokemonListFinal[1043].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10146.png";

    pokemonListFinal[1046].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10149.png";
    pokemonListFinal[1047].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10150.png";
    pokemonListFinal[1048].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10151.png";

    pokemonListFinal[1050].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10153.png";
    pokemonListFinal[1051].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10154.png";

    pokemonListFinal[1055].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/25.png"; //10158
    pokemonListFinal[1056].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/133.png"; //10159

    pokemonListFinal[1078].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/718-10.png"; //10181
    pokemonListFinal[1079].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/845-gulping.png"; //10182
    pokemonListFinal[1080].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/845-gorging.png"; //10183

    pokemonListFinal[1084].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/877-hangry.png"; //10187
    pokemonListFinal[1089].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/893-dada.png"; //10192

    pokemonListFinal[1125].image = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10228.png";

    return pokemonListFinal;
}


const init = async () => {
    try {
        const list = await fetchList();
        if (list.length > 0) {
            document.getElementById("poke-list").innerHTML = list.map(pokemon => listItem(pokemon)).join(" ");
        }
    } catch (err) {
        console.log(err);
    }
}

const resetCards = () => {
    const item = document.getElementsByClassName("pokemon-card-button");
    for (let i = 0; i < item.length; i++) {
        item[i].classList.remove("pokemon-card-button-active");
    }

    const cards = document.getElementsByClassName("pokemon-card-item");
    for (let i = 0; i < cards.length; i++) {
        cards[i].classList.remove("pokemon-card-item-active");
    }
    cards[0].classList.add("pokemon-card-item-active");
    item[0].classList.add("pokemon-card-button-active");
}


const buttons = document.getElementsByClassName("pokemon-card-button");
for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function (e) {
        const items = document.getElementsByClassName("pokemon-card-button");
        let item = 0;
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove("pokemon-card-button-active");
            if (items[i] === e.target)
                item = i;
        }

        const cards = document.getElementsByClassName("pokemon-card-item");

        for (let i = 0; i < cards.length; i++) {
            cards[i].classList.remove("pokemon-card-item-active");
        }

        cards[item].classList.add("pokemon-card-item-active");

        e.target.classList.add("pokemon-card-button-active");
    })
}


document.getElementById("close-button").addEventListener("click", function () {

    document.getElementById("pokemon").classList.remove("active");
    const items = document.getElementsByClassName("list-item-selected");
    if (items.length > 0)
      items[0].classList.remove("list-item-selected");

    
})

init();