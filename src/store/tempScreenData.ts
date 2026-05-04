const THEATERS = ["Theater 1", "Theater 2", "Theater 3"];
const SCREENS = ["Screen 1", "Screen 2", "Screen 3"];

const MOVIE_COLORS = {
  "Movie A": { bg: "bg-red-300", text: "text-red-900" },
  "Movie B": { bg: "bg-blue-300", text: "text-blue-900" },
  "Movie C": { bg: "bg-yellow-300", text: "text-yellow-900" },
  "Movie D": { bg: "bg-orange-300", text: "text-orange-900" },
  "Movie E": { bg: "bg-purple-300", text: "text-purple-900" },
  "Movie F": { bg: "bg-green-300", text: "text-green-900" },
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

export { THEATERS, SCREENS, MOVIE_COLORS, INITIAL_SHOWTIMES };
