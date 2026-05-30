"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="animate-screenIn">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Profile />
        </TabsContent>
        <TabsContent value="notifications">
          <Notifications />
        </TabsContent>
        <TabsContent value="workspace">
          <Workspace />
        </TabsContent>
        <TabsContent value="security">
          <Security />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Profile() {
  const [name, setName] = useState("Alex Morgan");
  const [email] = useState("alex@example.com");
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold">Profile</h3>
      <p className="mb-5 text-sm text-muted">Update your personal information.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" className="mt-1.5" value={email} disabled />
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button variant="primary" onClick={() => toast.success("Profile updated")}>
          Save changes
        </Button>
      </div>
    </Card>
  );
}

function Notifications() {
  const [state, setState] = useState({ email: true, push: false, leads: true, weekly: true });
  const items: { key: keyof typeof state; title: string; sub: string }[] = [
    { key: "email", title: "Email notifications", sub: "Receive product updates and alerts." },
    { key: "push", title: "Push notifications", sub: "Get notified when an automation triggers." },
    { key: "leads", title: "New lead alerts", sub: "Email me when a lead is captured." },
    { key: "weekly", title: "Weekly digest", sub: "A summary of performance every Monday." },
  ];
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold">Notifications</h3>
      <p className="mb-5 text-sm text-muted">Choose what we email you about.</p>
      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <div key={it.key} className="flex items-center justify-between rounded-md border border-line p-4">
            <div>
              <div className="text-sm font-semibold">{it.title}</div>
              <div className="text-[12.5px] text-muted">{it.sub}</div>
            </div>
            <Switch checked={state[it.key]} onCheckedChange={(v) => setState((s) => ({ ...s, [it.key]: v }))} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function Workspace() {
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold">Workspace</h3>
      <p className="mb-5 text-sm text-muted">Configure your workspace and team.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Workspace name</Label>
          <Input className="mt-1.5" defaultValue="Maya Studio" />
        </div>
        <div>
          <Label>Timezone</Label>
          <Input className="mt-1.5" defaultValue="Asia/Kolkata (UTC+5:30)" />
        </div>
      </div>
    </Card>
  );
}

function Security() {
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold">Security</h3>
      <p className="mb-5 text-sm text-muted">Manage your password and sessions.</p>
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit">Change password</Button>
        <Button variant="ghost" className="w-fit">Enable two-factor authentication</Button>
        <Button variant="danger" className="w-fit">Sign out all other sessions</Button>
      </div>
    </Card>
  );
}
