export const getRandomColor = () => {
  const blue = "#0074D9";
  const skyBlue = "#7FDBFF";
  const BrightBlue = "#0096FF";
  const CobaltBlue = "#1F51FF";
  const Bl = "#87ceeb";

  const colors = [blue, skyBlue, BrightBlue, CobaltBlue, Bl];
  return colors[Math.floor(Math.random() * colors.length)];
};
