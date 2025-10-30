
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Package, PackageCheck, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";


export default function LiveInventoryPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Live Inventory Tracker (LIT)</CardTitle>
              <CardDescription>
                Source of truth for stock. Centralized record of inventory and all major transactions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="raw-materials">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="raw-materials">
                <Package className="mr-2 h-4 w-4" />
                Raw Materials (RM)
              </TabsTrigger>
              <TabsTrigger value="finished-goods">
                 <PackageCheck className="mr-2 h-4 w-4" />
                Finished Goods (FG)
              </TabsTrigger>
              <TabsTrigger value="transaction-log">
                <History className="mr-2 h-4 w-4" />
                Transaction Log
              </TabsTrigger>
            </TabsList>
            <TabsContent value="raw-materials" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Raw Material Stock</CardTitle>
                        <CardDescription>Live data pulled from SAP ZMB52.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Placeholder for Raw Material inventory levels.</p>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="finished-goods" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Finished Goods Stock</CardTitle>
                        <CardDescription>Live data from main warehouse and all DCs from SAP ZMB52.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Placeholder for Finished Goods inventory levels.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="transaction-log" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Major Transaction Log</CardTitle>
                        <CardDescription>A record of all final quantities pushed from role-specific tabs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No transactions logged yet for this round.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
