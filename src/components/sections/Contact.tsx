"use client";

import { useRef, useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";

// Fill in your actual details here.
const contact = {
    email: "itsrohitsingh707@gmail.com",
    linkedin: "https://linkedin.com/in/rohit-singh-707",
    github: "https://github.com/rohitx-dev",
    location: "Sector-49, Noida, India",
};

const inputClass =
    "mt-1.5 w-full rounded-full border border-white/10 bg-[#101729] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/15";

export default function Contact() {
    const [notice, setNotice] = useState("");
    const [isSending, setIsSending] = useState(false);
    const sendingRef = useRef(false);

    const details = [
        {
            label: "Email",
            value: contact.email,
            href: contact.email ? `mailto:${contact.email}` : undefined,
        },
        {
            label: "LinkedIn",
            value: contact.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
            href: contact.linkedin || undefined,
        },
        {
            label: "GitHub",
            value: contact.github.replace(/^https?:\/\/(www\.)?/, ""),
            href: contact.github || undefined,
        },
        {
            label: "Location",
            value: contact.location,
            href: undefined,
        },
    ];

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (sendingRef.current) return;

        const form = event.currentTarget;

        if (!form.reportValidity()) return;

        const data = new FormData(form);
        const name = String(data.get("name") ?? "").trim();
        const email = String(data.get("email") ?? "").trim();
        const message = String(data.get("message") ?? "").trim();

        if (!name || !email || !message) {
            setNotice("Please complete all three fields.");
            return;
        }

        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            setNotice(
                "The contact form is temporarily unavailable. Please use my email link.",
            );
            return;
        }

        sendingRef.current = true;
        setIsSending(true);
        setNotice("");

        try {
            await emailjs.send(
                serviceId,
                templateId,
                { name, email, message },
                { publicKey },
            );

            form.reset();
            setNotice("Message sent successfully. Thank you for getting in touch!");
        } catch {
            setNotice(
                "Your message couldn’t be sent. Please try again or use my email link.",
            );
        } finally {
            sendingRef.current = false;
            setIsSending(false);
        }
    }

    return (
        <section
            id="contact"
            aria-labelledby="contact-heading"
            className="border-t border-white/5 px-5 py-16 sm:px-8 sm:py-20"
        >
            <div className="mx-auto max-w-4xl">
                {/* Heading outside the card */}
                <h2
                    id="contact-heading"
                    className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl"
                >
                    Let’s build{" "}
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        something.
                    </span>
                </h2>

                {/* Shared contact card */}
                <div className="mt-8 grid gap-8 rounded-3xl border border-white/10 bg-[#1a2436] p-6 shadow-xl shadow-black/10 md:grid-cols-[0.9fr_1.1fr] md:gap-10 md:p-8">
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            Contact details
                        </h3>

                        <dl className="mt-5 space-y-4">
                            {details.map((detail) => (
                                <div key={detail.label}>
                                    <dt className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                                        {detail.label}
                                    </dt>

                                    <dd className="mt-1 break-words text-sm leading-6 text-slate-200">
                                        {detail.href ? (
                                            <a
                                                href={detail.href}
                                                target={
                                                    detail.label === "Email" ? undefined : "_blank"
                                                }
                                                rel={
                                                    detail.label === "Email"
                                                        ? undefined
                                                        : "noopener noreferrer"
                                                }
                                                className="rounded transition-colors hover:text-violet-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
                                            >
                                                {detail.value}
                                            </a>
                                        ) : (
                                            detail.value || "—"
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        <p className="mt-6 max-w-xs text-sm leading-6 text-slate-400">
                            Short briefs are welcome — let’s explore what’s possible
                            and work out a realistic timeline.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        aria-label="Contact Rohit"
                        className="min-w-0 space-y-3.5"
                    >
                        <div>
                            <label
                                htmlFor="contact-name"
                                className="text-xs font-medium text-slate-400"
                            >
                                Name
                            </label>
                            <input
                                id="contact-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                placeholder="Your name"
                                required
                                maxLength={100}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="contact-email"
                                className="text-xs font-medium text-slate-400"
                            >
                                Email
                            </label>
                            <input
                                id="contact-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                required
                                maxLength={254}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="contact-message"
                                className="text-xs font-medium text-slate-400"
                            >
                                Message
                            </label>
                            <textarea
                                id="contact-message"
                                name="message"
                                placeholder="Tell me briefly what you need..."
                                required
                                rows={3}
                                maxLength={1500}
                                className="mt-1.5 block w-full resize-y rounded-2xl border border-white/10 bg-[#101729] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/15"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            className="min-h-11 w-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-[filter,box-shadow] hover:brightness-110 hover:shadow-violet-500/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSending ? "Sending…" : "Send message"}
                        </button>
                        <p role="status" className="text-xs leading-5 text-violet-300">
                            {notice}
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
}