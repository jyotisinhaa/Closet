// Shared profile constants used by both Onboarding and Settings.

export const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];

export const BODY_TYPES = [
  {
    key: "hourglass",
    label: "Hourglass",
    desc: "Balanced shoulders & hips, defined waist",
    svg: (
      <svg viewBox="0 0 60 120" width="44" height="88">
        <circle cx="30" cy="10" r="8" fill="currentColor" />
        <path
          d="M 25,18 C 16,22 7,24 7,26 C 4,36 10,48 20,56 C 12,62 4,66 7,68 L 7,78 L 23,78 L 23,118 L 37,118 L 37,78 L 53,78 L 53,68 C 56,66 48,62 40,56 C 50,48 56,36 53,26 C 53,24 44,22 35,18 Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    key: "rectangle",
    label: "Rectangle",
    desc: "Shoulders, waist & hips similar width",
    svg: (
      <svg viewBox="0 0 60 120" width="44" height="88">
        <circle cx="30" cy="10" r="8" fill="currentColor" />
        <path
          d="M 25,18 C 20,22 16,23 16,26 C 14,36 16,48 16,56 C 15,62 14,66 16,68 L 16,78 L 24,78 L 24,118 L 36,118 L 36,78 L 44,78 L 44,68 C 46,66 45,62 44,56 C 44,48 46,36 44,26 C 44,23 40,22 35,18 Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    key: "pear",
    label: "Pear",
    desc: "Hips wider than shoulders",
    svg: (
      <svg viewBox="0 0 60 120" width="44" height="88">
        <circle cx="30" cy="10" r="8" fill="currentColor" />
        <path
          d="M 26,18 C 22,22 20,23 20,26 C 18,36 18,48 18,56 C 14,62 6,66 7,68 L 7,78 L 23,78 L 23,118 L 37,118 L 37,78 L 53,78 L 53,68 C 54,66 46,62 42,56 C 42,48 42,36 40,26 C 40,23 38,22 34,18 Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    key: "apple",
    label: "Apple",
    desc: "Shoulders wider, fuller midsection",
    svg: (
      <svg viewBox="0 0 60 120" width="44" height="88">
        <circle cx="30" cy="10" r="8" fill="currentColor" />
        <path
          d="M 25,18 C 19,22 14,23 14,26 C 8,34 5,46 7,56 C 5,62 8,66 14,68 L 14,78 L 24,78 L 24,118 L 36,118 L 36,78 L 46,78 L 46,68 C 52,66 55,62 53,56 C 55,46 52,34 46,26 C 46,23 41,22 35,18 Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    key: "inverted",
    label: "Inverted Triangle",
    desc: "Shoulders notably wider than hips",
    svg: (
      <svg viewBox="0 0 60 120" width="44" height="88">
        <circle cx="30" cy="10" r="8" fill="currentColor" />
        <path
          d="M 25,18 C 15,22 5,23 5,26 C 4,36 12,48 18,56 C 16,62 18,66 22,68 L 22,78 L 27,78 L 27,118 L 33,118 L 33,78 L 38,78 L 38,68 C 42,66 44,62 42,56 C 48,48 56,36 55,26 C 55,23 45,22 35,18 Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];
