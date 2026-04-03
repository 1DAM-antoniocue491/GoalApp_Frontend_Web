import React from "react";
import Nav from "../../../components/Nav";
import { TfiCup } from "react-icons/tfi";
import { MdOutlineSecurity } from "react-icons/md";
import { IoPersonAddSharp } from "react-icons/io5";
import UserCard from "../components/dashboard/UserCard";
import QuickActionButton from "../components/dashboard/QuickActionButton";
import LiveMatchCard from "../components/dashboard/LiveMatchCard";
import ResultCard from "../components/dashboard/ResultCard";
import UpcomingMatchCard from "../components/dashboard/UpcomingMatchCard";
import ActivityItem from "../components/dashboard/ActivityItem";
import SummaryCard from "../components/dashboard/SummaryCard";
import SectionHeader from "../components/dashboard/SectionHeader";
import Badge from "../../../components/ui/Badge";

export default function DashboardPage() {

    const quickActions = [
        { icon: TfiCup, label: "+ Nueva Liga" },
        { icon: MdOutlineSecurity, label: "+ Nuevo Equipo" },
        { icon: IoPersonAddSharp, label: "+ Añadir Jugador" },
    ];

    const liveMatches = [
        { league: "La Liga", home: "Atlético de Madrid", away: "Sevilla", score: "1 - 0", minute: "67'" },
        { league: "La Liga", home: "Real Madrid", away: "Barcelona", score: "2 - 1", minute: "45'" },
        { league: "La Liga", home: "Betis", away: "Valencia", score: "0 - 0", minute: "23'" },
    ];

    const recentResults = [
        { league: "La Liga", home: "Atlético de Madrid", away: "Sevilla", score: "1 - 0", status: "FT" },
        { league: "La Liga", home: "Real Madrid", away: "Barcelona", score: "2 - 1", status: "FT" },
        { league: "La Liga", home: "Betis", away: "Valencia", score: "0 - 0", status: "FT" },
    ];

    const upcomingMatches = [
        { teams: "Sevilla VS Betis", league: "La Liga", time: "Hoy, 21:00" },
        { teams: "Sevilla VS Betis", league: "La Liga", time: "Hoy, 21:00" }
    ];

    const activities = [
        { title: "Nuevo jugador añadido", team: "FC Barcelona", time: "Hace 2 horas" },
        { title: "Nuevo jugador añadido", team: "FC Barcelona", time: "Hace 2 horas" },
        { title: "Nuevo jugador añadido", team: "FC Barcelona", time: "Hace 2 horas" },
    ];

    const summary = [
        { label: "Ligas Activas", value: 8, color: "lime" as const },
        { label: "Equipos", value: 64, color: "blue" as const },
        { label: "Jugadores", value: 1248, color: "blue" as const },
        { label: "Partidos Hoy", value: 12, color: "lime" as const }
    ];

    return (
        <>
        <Nav />

        <div className="flex flex-col bg-zinc-950 p-5 sm:px-10 gap-5 sm:gap-10">

            <h1 className="text-white text-2xl font-semibold">
                Hola, Juan Pérez
            </h1>

            {/* USER CARD */}
            <UserCard name="John Doe" role="Administrador">
                <Badge variant="info">Gestionar roles</Badge>
            </UserCard>


            {/* QUICK ACTIONS */}
            <div className="flex flex-col gap-2">
                <SectionHeader title="Acciones Rápidas" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                    {quickActions.map((action, i) => (
                        <QuickActionButton
                            key={i}
                            icon={action.icon}
                            label={action.label}
                        />
                    ))}
                </div>
            </div>


            {/* LIVE MATCHES */}
            <div className="flex flex-col gap-2">
                <SectionHeader
                    title="Partidos en vivo"
                    badge={liveMatches.length}
                    badgeVariant="danger"
                />

                <div className="flex flex-col gap-2">
                    {liveMatches.map((match, i) => (
                        <LiveMatchCard
                            key={i}
                            league={match.league}
                            home={match.home}
                            away={match.away}
                            score={match.score}
                            minute={match.minute}
                        />
                    ))}
                </div>
            </div>


            {/* RECENT RESULTS */}
            <div className="flex flex-col gap-2">
                <SectionHeader
                    title="Resultados recientes"
                    linkText="Ver todos"
                    linkHref="#"
                />

                <div className="flex flex-col gap-2">
                    {recentResults.map((match, i) => (
                        <ResultCard
                            key={i}
                            league={match.league}
                            home={match.home}
                            away={match.away}
                            score={match.score}
                            status={match.status}
                        />
                    ))}
                </div>
            </div>


            {/* UPCOMING MATCHES */}
            <div className="flex flex-col gap-2">
                <SectionHeader title="Próximos partidos" />

                <div className="flex flex-col gap-2">
                    {upcomingMatches.map((match, i) => (
                        <UpcomingMatchCard
                            key={i}
                            teams={match.teams}
                            league={match.league}
                            time={match.time}
                        />
                    ))}
                </div>
            </div>


            {/* ACTIVITY + SUMMARY */}
            <div className="flex flex-col md:flex-row gap-3">

                {/* ACTIVITY */}
                <div className="flex flex-col gap-5 bg-zinc-900 rounded-xl p-5 w-full md:w-1/2">
                    <p className="text-white font-semibold text-md">
                        Actividad Reciente
                    </p>

                    {activities.map((activity, i) => (
                        <ActivityItem
                            key={i}
                            title={activity.title}
                            team={activity.team}
                            time={activity.time}
                        />
                    ))}
                </div>


                {/* SUMMARY */}
                <div className="flex flex-col gap-5 bg-zinc-900 rounded-xl p-5 w-full md:w-1/2">
                    <p className="text-white font-semibold text-md">
                        Resumen
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {summary.map((item, i) => (
                            <SummaryCard
                                key={i}
                                label={item.label}
                                value={item.value}
                                color={item.color}
                            />
                        ))}
                    </div>
                </div>

            </div>

        </div>
        </>
    );
}