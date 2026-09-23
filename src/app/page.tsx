import type { Metadata } from "next";
import { RoomExperience } from "@/components/room/RoomExperience";
import { RoomJsonLd } from "@/components/room/seo/RoomJsonLd";
import { roomMetadata } from "@/lib/room-metadata";
import { getRoomProjects } from "@/lib/room-projects";

export const metadata: Metadata = roomMetadata(null);

export default function Home() {
  return (
    <>
      <RoomJsonLd spot={null} />
      <RoomExperience initialSpot={null} projects={getRoomProjects()} />
    </>
  );
}
