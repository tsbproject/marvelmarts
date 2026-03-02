




"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useGlobalSettings } from "@/app/_context/GlobalSettingsContext";
import { useDefaultSettings } from "@/app/_context/GlobalSettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";

// ── Zod Schema – now includes header & footer fields ───────────────────────
const settingsSchema = z.object({
  accentNavy: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  brandPrimary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  layoutScale: z.number().min(0.5).max(2.0),
  bodyFontScale: z.number().min(0.8).max(1.5),
  headingFontScale: z.number().min(0.8).max(1.5),
  showEcommerceCarousel: z.boolean(),
  showFeaturedProducts: z.boolean(),
  showFeaturedCategories: z.boolean(),
  showTrendingProducts: z.boolean(),
  showFlashSales: z.boolean(),
  showNewArrivals: z.boolean(),
  showTestimonials: z.boolean(),
  productCardRadius: z.string().min(1, "Required"),

  // ── Header fields ──────────────────────────────────────────────────────
  headerBg: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  headerText: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  headerBorder: z.string().optional() 
 
  .refine(
    val => val === "transparent" || !val || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val),
    { message: "Must be valid hex (#RRGGBB/#RGB) or 'transparent'" }
  )
  .optional(),

  showSearchBar: z.boolean(),

  // ── Footer fields ──────────────────────────────────────────────────────
  footerBg: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  footerText: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  showSocialIcons: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const { settings, refreshSettings, isLoading: settingsLoading } = useGlobalSettings();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      accentNavy: settings?.accentNavy || "#002B5B",
      brandPrimary: settings?.brandPrimary || "#F7931E",
      layoutScale: settings?.layoutScale || 1.0,
      bodyFontScale: settings?.bodyFontScale || 1.0,
      headingFontScale: settings?.headingFontScale || 1.0,
      showEcommerceCarousel: settings?.showEcommerceCarousel ?? true,
      showFeaturedProducts: settings?.showFeaturedProducts ?? true,
      showFeaturedCategories: settings?.showFeaturedCategories ?? true,
      showTrendingProducts: settings?.showTrendingProducts ?? true,
      showFlashSales: settings?.showFlashSales ?? true,
      showNewArrivals: settings?.showNewArrivals ?? true,
      showTestimonials: settings?.showTestimonials ?? true,
      productCardRadius: settings?.productCardRadius || "2rem",

      headerBg: settings?.headerBg || "#FFFFFF",
      headerText: settings?.headerText || "#000000",
      headerBorder: settings?.headerBorder || "transparent",
      showSearchBar: settings?.showSearchBar ?? true,

      footerBg: settings?.footerBg || "#F8F8F8",
      footerText: settings?.footerText || "#333333",
      showSocialIcons: settings?.showSocialIcons ?? true,
    },
  });

  useEffect(() => {
    if (!settingsLoading && settings) {
      form.reset({
        accentNavy: settings.accentNavy || "#002B5B",
        brandPrimary: settings.brandPrimary || "#F7931E",
        layoutScale: settings.layoutScale || 1.0,
        bodyFontScale: settings.bodyFontScale || 1.0,
        headingFontScale: settings.headingFontScale || 1.0,
        showEcommerceCarousel: settings.showEcommerceCarousel ?? true,
        showFeaturedProducts: settings.showFeaturedProducts ?? true,
        showFeaturedCategories: settings.showFeaturedCategories ?? true,
        showTrendingProducts: settings.showTrendingProducts ?? true,
        showFlashSales: settings.showFlashSales ?? true,
        showNewArrivals: settings.showNewArrivals ?? true,
        showTestimonials: settings.showTestimonials ?? true,
        productCardRadius: settings.productCardRadius || "2rem",

        headerBg: settings.headerBg || "#FFFFFF",
        headerText: settings.headerText || "#000000",
        headerBorder: settings.headerBorder || "transparent",
        showSearchBar: settings.showSearchBar ?? true,

        footerBg: settings.footerBg || "#F8F8F8",
        footerText: settings.footerText || "#333333",
        showSocialIcons: settings.showSocialIcons ?? true,
      });
    }
  }, [settings, settingsLoading, form]);

  const onSubmit = async (data: SettingsFormValues) => {
  console.log("Raw form values before send:", form.getValues());
  console.log("Validated data to send:", data);

  // Force include all fields (even if unchanged)
  const fullData = {
    ...useDefaultSettings, // start with defaults
    ...data, // override with form changes
  };

  console.log("Full payload to PATCH:", fullData);

  setIsSaving(true);
  try {
    const response = await fetch("/api/site-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullData),
    });
   
    if (!response.ok) {
        let errorMessage = "Failed to save settings";

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `Server error (${response.status})`;
        } catch {
          errorMessage = `Server responded with ${response.status}: ${response.statusText}`;
        }

        console.error("Save failed:", {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        });

        throw new Error(errorMessage);
      }

      const updatedData = await response.json();
      console.log("Settings saved successfully:", updatedData);

      await refreshSettings();
      toast.success("Settings saved successfully!", {
        description: "All changes are now applied site-wide.",
      });
    } catch (error: any) {
      console.error("onSubmit error:", error);
      toast.error("Failed to save settings", {
        description: error.message || "An unexpected error occurred. Check console for details.",
      });
    } finally {
      setIsSaving(false);
    }
  };

 
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-black text-accent-navy">
            MarvelMarts Global Settings
          </CardTitle>
          <CardDescription>
            Customize colors, typography, visibility, and component styles site-wide.
            Changes apply instantly after saving.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="visibility">Visibility</TabsTrigger>
              </TabsList>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="accentNavy">Accent Navy</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="accentNavy"
                        type="color"
                        {...form.register("accentNavy")}
                        className="w-12 h-10 p-1 rounded"
                      />
                      <Input
                        {...form.register("accentNavy")}
                        placeholder="#002B5B"
                      />
                    </div>
                    {form.formState.errors.accentNavy && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.accentNavy.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandPrimary">Brand Primary (Orange)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="brandPrimary"
                        type="color"
                        {...form.register("brandPrimary")}
                        className="w-12 h-10 p-1 rounded"
                      />
                      <Input
                        {...form.register("brandPrimary")}
                        placeholder="#F7931E"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Layout Scale ({form.watch("layoutScale")})</Label>
                    <Slider
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[form.watch("layoutScale") || 1]}
                      onValueChange={(val) => form.setValue("layoutScale", val[0])}
                    />
                  </div>

                  <div>
                    <Label>Body Font Scale ({form.watch("bodyFontScale")})</Label>
                    <Slider
                      min={0.8}
                      max={1.5}
                      step={0.05}
                      value={[form.watch("bodyFontScale") || 1]}
                      onValueChange={(val) => form.setValue("bodyFontScale", val[0])}
                    />
                  </div>

                  <div>
                    <Label>Heading Font Scale ({form.watch("headingFontScale")})</Label>
                    <Slider
                      min={0.8}
                      max={1.5}
                      step={0.05}
                      value={[form.watch("headingFontScale") || 1]}
                      onValueChange={(val) => form.setValue("headingFontScale", val[0])}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Components Tab – now includes Header & Footer */}
              <TabsContent value="components" className="space-y-8">
                {/* Product Card */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-accent-navy">Product Card</h3>
                  <div>
                    <Label htmlFor="productCardRadius">Border Radius</Label>
                    <Input
                      id="productCardRadius"
                      placeholder="2rem"
                      {...form.register("productCardRadius")}
                    />
                  </div>
                </div>

                {/* Header Controls */}
                <div className="space-y-2">
                    <Label htmlFor="headerBg">Background Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="headerBg"
                        type="color"
                        {...form.register("headerBg")}
                        className="w-12 h-10 p-1 rounded"
                        onChange={(e) => {
                          form.setValue("headerBg", e.target.value);
                          console.log("headerBg changed to:", e.target.value);
                        }}
                      />
                      <Input
                        {...form.register("headerBg")}
                        placeholder="#FFFFFF"
                        onChange={(e) => {
                          form.setValue("headerBg", e.target.value);
                          console.log("headerBg text changed to:", e.target.value);
                        }}
                      />
                    </div>
                  </div>

                    <div className="space-y-2">
                      <Label htmlFor="headerText">Text Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="headerText"
                          type="color"
                          {...form.register("headerText")}
                          className="w-12 h-10 p-1 rounded"
                        />
                        <Input
                          {...form.register("headerText")}
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="headerBorder">Border Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="headerBorder"
                          type="color"
                          {...form.register("headerBorder")}
                          className="w-12 h-10 p-1 rounded"
                        />
                        <Input
                          {...form.register("headerBorder")}
                          placeholder="transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Label htmlFor="showSearchBar">Show Search Bar</Label>
                      <Switch
                        id="showSearchBar"
                        checked={form.watch("showSearchBar")}
                        onCheckedChange={(checked) => form.setValue("showSearchBar", checked)}
                      />
                    </div>
              
              

                {/* Footer Controls */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-accent-navy">Footer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="footerBg">Background Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="footerBg"
                          type="color"
                          {...form.register("footerBg")}
                          className="w-12 h-10 p-1 rounded"
                        />
                        <Input
                          {...form.register("footerBg")}
                          placeholder="#F8F8F8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="footerText">Text Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="footerText"
                          type="color"
                          {...form.register("footerText")}
                          className="w-12 h-10 p-1 rounded"
                        />
                        <Input
                          {...form.register("footerText")}
                          placeholder="#333333"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 col-span-2">
                      <Label htmlFor="showSocialIcons">Show Social Icons</Label>
                      <Switch
                        id="showSocialIcons"
                        checked={form.watch("showSocialIcons")}
                        onCheckedChange={(checked) => form.setValue("showSocialIcons", checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Visibility Tab */}
              <TabsContent value="visibility" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showEcommerceCarousel">Show Ecommerce Carousel</Label>
                    <Switch
                      id="showEcommerceCarousel"
                      checked={form.watch("showEcommerceCarousel")}
                      onCheckedChange={(checked) => form.setValue("showEcommerceCarousel", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showFeaturedProducts">Show Featured Products</Label>
                    <Switch
                      id="showFeaturedProducts"
                      checked={form.watch("showFeaturedProducts")}
                      onCheckedChange={(checked) => form.setValue("showFeaturedProducts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showFeaturedCategories">Show Featured Categories</Label>
                    <Switch
                      id="showFeaturedCategories"
                      checked={form.watch("showFeaturedCategories")}
                      onCheckedChange={(checked) => form.setValue("showFeaturedCategories", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showNewArrivals">Show New Arrivals</Label>
                    <Switch
                      id="showNewArrivals"
                      checked={form.watch("showNewArrivals")}
                      onCheckedChange={(checked) => form.setValue("showNewArrivals", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showFlashSales">Show Flash Sales</Label>
                    <Switch
                      id="showFlashSales"
                      checked={form.watch("showFlashSales")}
                      onCheckedChange={(checked) => form.setValue("showFlashSales", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showTrendingProducts">Show Trending Products</Label>
                    <Switch
                      id="showTrendingProducts"
                      checked={form.watch("showTrendingProducts")}
                      onCheckedChange={(checked) => form.setValue("showTrendingProducts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showTestimonials">Show Testimonials</Label>
                    <Switch
                      id="showTestimonials"
                      checked={form.watch("showTestimonials")}
                      onCheckedChange={(checked) => form.setValue("showTestimonials", checked)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-6 border-t">
              <Button
                type="submit"
                disabled={isSaving || settingsLoading}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-black px-8"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}