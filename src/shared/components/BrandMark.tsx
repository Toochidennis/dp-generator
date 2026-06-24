type Props = { inverted?: boolean };

export function BrandMark({ inverted = false }: Props) {
  return <span className={`inline-flex shrink-0 items-center ${inverted ? "" : "rounded-xl bg-[#172b4d] px-3 py-2 shadow-sm"}`}>
    <img src="/digital-dreams-logo.png" alt="Digital Dreams ICT Academy" className="h-6 w-auto object-contain sm:h-7" />
  </span>;
}
