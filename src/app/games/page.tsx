import type { Metadata } from "next";
import { RoomExperience } from "@/components/room/RoomExperience";
import { RoomJsonLd } from "@/components/room/seo/RoomJsonLd";
import { roomMetadata } from "@/lib/room-metadata";
import { getRoomPhotos } from "@/lib/room-photos";
import { getRoomProjects } from "@/lib/room-projects";

export const metadata: Metadata = roomMetadata("games");

export default function GamesPage() {
  return (
    <>
      <RoomJsonLd spot="games" />
      <RoomExperience initialSpot="games" projects={getRoomProjects()} photos={getRoomPhotos()} />
    </>
  );
}
