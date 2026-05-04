import tempMoviePoster from "../assets/tempMoviePoster.jpg";

/** Shared temp poster for all seed movies (Vite resolves import to a public URL) */
const DEFAULT_POSTER_URL = tempMoviePoster;

const MOVIES = [
  {
    id: 1,
    title: "Interstellar",
    genre: "Sci-Fi",
    duration: 169,
    status: "Active",
    posterUrl: DEFAULT_POSTER_URL,
  },
  {
    id: 2,
    title: "Dune: Part Two",
    genre: "Sci-Fi",
    duration: 166,
    status: "Active",
    posterUrl: DEFAULT_POSTER_URL,
  },
  {
    id: 3,
    title: "Oppenheimer",
    genre: "Drama",
    duration: 180,
    status: "Active",
    posterUrl: DEFAULT_POSTER_URL,
  },
  {
    id: 4,
    title: "The Batman",
    genre: "Action",
    duration: 176,
    status: "Inactive",
    posterUrl: DEFAULT_POSTER_URL,
  },
  {
    id: 5,
    title: "Avatar 2",
    genre: "Action",
    duration: 192,
    status: "Inactive",
    posterUrl: DEFAULT_POSTER_URL,
  },
  {
    id: 6,
    title: "Inception",
    genre: "Thriller",
    duration: 148,
    status: "Inactive",
    posterUrl: DEFAULT_POSTER_URL,
  },
];

export { MOVIES, DEFAULT_POSTER_URL };
