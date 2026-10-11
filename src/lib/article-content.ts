import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "p",
  "br",

  "h2",
  "h3",

  "strong",
  "b",

  "em",
  "i",

  "ul",
  "ol",
  "li",

  "blockquote",

  "a",

  "hr",
] as const;

export function sanitizeArticleHtml(
  value: string,
) {
  return sanitizeHtml(
    value,
    {
      allowedTags: [
        ...allowedTags,
      ],

      allowedAttributes: {
        a: [
          "href",
          "target",
          "rel",
        ],
      },

      allowedSchemes: [
        "http",
        "https",
        "mailto",
        "tel",
      ],

      transformTags: {
        a: (
          tagName,
          attribs,
        ) => ({
          tagName,

          attribs: {
            ...attribs,

            target:
              "_blank",

            rel:
              "noopener noreferrer",
          },
        }),
      },

      disallowedTagsMode:
        "discard",
    },
  ).trim();
}

export function getArticleText(
  html: string,
) {
  return sanitizeHtml(
    html,
    {
      allowedTags:
        [],

      allowedAttributes:
        {},
    },
  )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

export function isArticleContentValid(
  html: string,
) {
  const text =
    getArticleText(
      html,
    );

  return (
    text.length >=
    30
  );
}