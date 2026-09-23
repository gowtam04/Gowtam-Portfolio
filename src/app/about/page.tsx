import type { Metadata } from "next";
import { RoomExperience } from "@/components/room/RoomExperience";
import { RoomJsonLd } from "@/components/room/seo/RoomJsonLd";
import { roomMetadata } from "@/lib/room-metadata";
import { getRoomProjects } from "@/lib/room-projects";

export const metadata: Metadata = roomMetadata("about");

export default function AboutPage() {
  return (
    <>
      <RoomJsonLd spot="about" />
      <RoomExperience initialSpot="about" projects={getRoomProjects()} />
    </>
  );
}
