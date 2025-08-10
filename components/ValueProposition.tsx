const AnimatedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
        <circle cx="25" cy="25" r="8" fill="limegreen">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </circle>
    </svg>
);

const valueProps = [
    "AI-Powered Insights",
    "Instant Support",
    "Conversational Analysis",
    "Data Privacy First"
];

export default function ValueProposition() {
    return (
        <section className="py-8">
            <div className="flex flex-wrap items-center justify-center font-medium gap-8 md:gap-14">
                {valueProps.map((prop) => (
                    <div key={prop} className="flex gap-0 items-center">
                        <AnimatedIcon />
                        <span className="text-sm md:text-base">{prop}</span>
                    </div>
                ))}
            </div>
        </section>
    )
}