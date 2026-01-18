import katex from "katex";

type LatexProps = {
  content: string;
};

const renderMixedLatex = (input: string) => {
  const parts: string[] = [];
  const segments = input.split("$");
  segments.forEach((segment, index) => {
    if (index % 2 === 1) {
      parts.push(
        katex.renderToString(segment, {
          throwOnError: false,
          output: "html",
        })
      );
    } else {
      parts.push(segment.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
    }
  });
  return parts.join("");
};

export default function Latex({ content }: LatexProps) {
  let html = content;
  try {
    html = renderMixedLatex(content);
  } catch {
    html = content;
  }

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
