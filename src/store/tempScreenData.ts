const THEATERS = ["Theater 1", "Theater 2", "Theater 3"];
const SCREENS = ["Screen 1", "Screen 2", "Screen 3"];

/** Keys match `--color-movie-{key}-bg|text` in `index.css` */
const MOVIE_PALETTE_KEY: Record<string, "a" | "b" | "c" | "d" | "e" | "f"> = {
  "Movie A": "a",
  "Movie B": "b",
  "Movie C": "c",
  "Movie D": "d",
  "Movie E": "e",
  "Movie F": "f",
};

const INITIAL_SHOWTIMES = [
  {
    id: 1,
    screen: "Screen 1",
    movie: "Movie A",
    startHour: 11,
    durationMin: 90,
    status: "Active",
  },
  {
    id: 2,
    screen: "Screen 1",
    movie: "Movie A",
    startHour: 14.5,
    durationMin: 90,
    status: "Active",
  },
  {
    id: 3,
    screen: "Screen 2",
    movie: "Movie B",
    startHour: 12,
    durationMin: 90,
    status: "Active",
  },
  {
    id: 4,
    screen: "Screen 2",
    movie: "Movie C",
    startHour: 15.5,
    durationMin: 90,
    status: "Inactive",
  },
  {
    id: 5,
    screen: "Screen 3",
    movie: "Movie C",
    startHour: 13.5,
    durationMin: 90,
    status: "Active",
  },
  {
    id: 6,
    screen: "Screen 3",
    movie: "Movie D",
    startHour: 17,
    durationMin: 90,
    status: "Active",
  },
];

export { THEATERS, SCREENS, MOVIE_PALETTE_KEY, INITIAL_SHOWTIMES };
