"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { formatDelay } from "@/lib/messages";
import { toast } from "sonner";

interface ComposeTabProps {
  onSchedule: (recipient: string, body: string, sendAt: number) => void;
}

const PRESETS = [
  { label: "5m", value: 5 },
  { label: "10m", value: 10 },
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
];

export function ComposeTab({ onSchedule }: ComposeTabProps) {
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"delay" | "schedule">("delay");
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const isValid = recipient.trim() && body.trim();

  function handleSubmit() {
    if (!isValid) return;

    let sendAt: number;
    if (mode === "delay") {
      sendAt = Date.now() + delayMinutes * 60 * 1000;
    } else {
      if (!scheduleDate || !scheduleTime) {
        toast.error("Please pick a date and time");
        return;
      }
      sendAt = new Date(`${scheduleDate}T${scheduleTime}`).getTime();
      if (sendAt <= Date.now()) {
        toast.error("Please pick a future date and time");
        return;
      }
    }

    onSchedule(recipient.trim(), body.trim(), sendAt);
    toast.success(`Message to ${recipient.trim()} scheduled`);
    setRecipient("");
    setBody("");
    setDelayMinutes(10);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Message</CardTitle>
        <CardDescription>
          Compose a message and choose when it should be delivered.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Recipient */}
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient</Label>
          <Input
            id="recipient"
            placeholder="Name or phone number"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        {/* Message Body */}
        <div className="space-y-2">
          <Label htmlFor="message-body">Message</Label>
          <Textarea
            id="message-body"
            placeholder="Type your message..."
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <Separator />

        {/* Mode Toggle */}
        <div className="space-y-3">
          <Label>Delivery Timing</Label>
          <div className="flex rounded-md border border-border bg-muted/50 p-0.5">
            <button
              className={`flex-1 rounded px-4 py-2 text-sm font-medium transition-all ${
                mode === "delay"
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMode("delay")}
            >
              Quick Delay
            </button>
            <button
              className={`flex-1 rounded px-4 py-2 text-sm font-medium transition-all ${
                mode === "schedule"
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMode("schedule")}
            >
              Schedule Date
            </button>
          </div>
        </div>

        {/* Quick Delay */}
        {mode === "delay" && (
          <div className="space-y-4 rounded-md border border-border bg-accent/30 p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Send after</p>
              <span className="text-3xl font-bold text-primary">
                {formatDelay(delayMinutes)}
              </span>
            </div>

            <Slider
              value={[delayMinutes]}
              onValueChange={(val) =>
                setDelayMinutes(Array.isArray(val) ? val[0] : val)
              }
              min={1}
              max={120}
              step={1}
              className="py-2"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 min</span>
              <span>2 hours</span>
            </div>

            <div className="flex justify-center gap-2 pt-1">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={
                    delayMinutes === preset.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setDelayMinutes(preset.value)}
                  className="rounded-full h-8 px-3 text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Date */}
        {mode === "schedule" && (
          <div className="space-y-4 rounded-md border border-border bg-accent/30 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Date</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Time</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
            {scheduleDate && scheduleTime && (
              <p className="text-sm text-muted-foreground">
                Delivers on{" "}
                <span className="font-medium text-foreground">
                  {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Submit */}
        <Button
          className="w-full"
          size="lg"
          disabled={!isValid}
          onClick={handleSubmit}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
          Schedule Message
        </Button>
      </CardContent>
    </Card>
  );
}
