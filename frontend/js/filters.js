import { renderUI } from "./product.js";
import { getProducts } from "./product.js";
const input = document.querySelector("#search");

let activeFilter = "all";

export function getActiveFilter() {
   return activeFilter;
}

export function applyFilters() {
   let value = input.value.trim().toLowerCase();
   let words = value.split(" ").filter(w => w !== "");
   let filtered = getProducts().filter(product => {
      // category filter
      if (activeFilter !== "all" && product.category !== activeFilter) { return false; }
      //search filter 
      if (words.length > 0) {
         return words.some(word =>
            getMatchScore(word, product.title.toLowerCase()) > 0);
      }
      return true;
   });
   if (words.length > 0) {
      filtered.sort((a, b) => {
         let scoreA = words.reduce((acc, word) =>
            acc + getMatchScore(word, a.title.toLowerCase()), 0);
         let scoreB = words.reduce((acc, word) =>
            acc + getMatchScore(word, b.title.toLowerCase()), 0);
         return scoreB - scoreA; // high score first 
      });
   }
   updateActiveFilterUI();
   renderUI(filtered, value, words);
};

function updateActiveFilterUI() {

   document.querySelectorAll(".filter-btns").forEach(btn => {
      btn.classList.remove("active-filter");

      if (btn.dataset.category === activeFilter) {
         btn.classList.add("active-filter");
      }
   });

}

export function setupFilters() {
   document.querySelectorAll(".filter-btns").forEach(btn => {

      btn.addEventListener("click", () => {
         activeFilter = btn.dataset.category;
         updateActiveFilterUI();
         applyFilters();
      });

   });

}

function fuzzyMatch(searchTerm, text) {
    searchTerm = searchTerm.toLowerCase();
    text = text.toLowerCase();

    let i = 0;
    let j = 0;

    while (i < searchTerm.length && j < text.length) {
        if (searchTerm[i] === text[j]) {
            i++;
        }
        j++;
    }

    return i === searchTerm.length;
}

// for showing best match 
function getMatchScore(word, text) {
    word = word.toLowerCase();
    text = text.toLowerCase();

    const words = text.split(" ");
    if (text === word) return 100;

    if (words.some(w => w.startsWith(word))) return 80;

    if (text.includes(word)) return 60;

    if (fuzzyMatch(word, text)) return 40;

    return 0;
}