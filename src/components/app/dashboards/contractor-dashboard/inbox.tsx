"use client";
import { ComponentPropsWithoutRef, useState } from "react";
import { Icons } from "../../../icons";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";
import { api } from "@/lib/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

interface InboxProps extends ComponentPropsWithoutRef<"div"> {
  userId: string;
}

const Inbox: React.FC<InboxProps> = ({ className, userId, ...props }) => {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  const {
    isLoading,
    isError,
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = api.bid.getUserBids.useInfiniteQuery(
    {
      id: userId,
      isActive: [true, false],
      status: ["pending", "retracted"],
      limit: 3,
    },
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage, _pages) => {
        if (lastPage.cursor) {
          return lastPage.cursor;
        }
      },
      retry: 1,
      retryDelay: 3000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  return (
    <div
      className={cn("grid w-full gap-2 md:grid-cols-3 md:gap-6", className)}
      {...props}
    >
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Hottest Listings</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              These listings are getting the most attention from users.
            </CardDescription>
          </div>
          <Button
            disabled={redirecting}
            type="button"
            onClick={() => {
              setRedirecting(true);
              router.push("/jobs/create");
            }}
          >
            {redirecting ? (
              <span className="flex items-center space-x-2">
                <Icons.loader className="animate-spin" />
              </span>
            ) : (
              "Create new"
            )}
          </Button>
        </CardHeader>
        <CardContent className="max-h-[calc(50vh-10rem)] overflow-auto">
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Incoming Bids</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            People bid on your company&#39;s listings while you were away.
          </CardDescription>
        </CardHeader>

        <CardContent className="max-h-[calc(50vh-10rem)] overflow-auto">
          {isError ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Icons.alert className="h-12 w-12" />
                <p className="">An error occured, please try again.</p>
                <Button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="w-full"
                >
                  {isRefetching ? (
                    <span className="flex items-center space-x-2">
                      <Icons.loader className="animate-spin" />
                    </span>
                  ) : (
                    "Try Again"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing Title</TableHead>
                    <TableHead>Bid Price</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <TableRow key={index} className="h-[100px] ">
                          <TableCell className="overflow-hidden text-ellipsis">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-[250px]" />
                              <Skeleton className="h-4 w-[200px]" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-12" />
                              <Skeleton className="h-4 w-8" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-10 w-20" />
                          </TableCell>
                        </TableRow>
                      ))
                    : data?.pages.map((page, i) => (
                        <React.Fragment key={i}>
                          {page.data.map((bid: any, index: number) => (
                            <TableRow key={index} className="h-[100px]">
                              <TableCell className="overflow-hidden text-ellipsis">
                                {bid.job?.title}
                              </TableCell>
                              <TableCell>${bid.price}</TableCell>
                              <TableCell className="text-right">
                                {/* //TODO: Implement view bid */}
                                <Button className="bg-primary">View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                </TableBody>
              </Table>
              {data && hasNextPage && (
                <div className="flex items-center justify-center">
                  <Button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full"
                  >
                    {isFetchingNextPage ? (
                      <span className="flex items-center space-x-2">
                        <Icons.loader className="animate-spin" />
                      </span>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inbox;
