import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MyPagination from "@/components/MyPagination";
import PaginationControls from "@/components/PaginationControls";
import { Key, Search, Lock, UserRound } from "lucide-react";
import { useUsers } from "@/services/principal/queries";
import {
  useAssignRole,
  useChangeStatus,
  useResetPassword,
} from "@/services/principal/mutation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomTooltip from "@/components/common/CustomToolTip";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import CustomPasswordInput from "@/components/common/CustomPasswordInput";
import { useRoles } from "@/services/common/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cleanString } from "@/helpers/removeWhiteSpace";

const UserManagement = () => {
  const [filter, setFilter] = useState({
    page: 1,
    pageSize: 10,
    search: "",
  });
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    userId: null,
    currentStatus: null,
  });
  const [passwordDialog, setPasswordDialog] = useState({
    isOpen: false,
    userId: null,
    username: null,
    newPassword: "",
  });
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [roleDialog, setRoleDialog] = useState({
    isOpen: false,
    userId: null,
    currentRole: null,
    userName: null,
    newRole: null,
  });

  const resetPasswordMutation = useResetPassword();
  const statusMutation = useChangeStatus();
  const userQuery = useUsers();
  const roleQuery = useRoles();
  const roles = roleQuery.data || [];
  const allUsers = userQuery.data || [];
  const assignRoleMutation = useAssignRole();
  const { page, pageSize, search } = filter;

  // Handle status change confirmation
  const handleStatusChange = () => {
    if (!statusDialog.userId) return;

    const newStatus =
      statusDialog.currentStatus === "Hoạt động"
        ? "Không hoạt động"
        : "Hoạt động";

    statusMutation.mutate(
      {
        userId: statusDialog.userId,
        status: newStatus,
      },
      {
        onSuccess: () => {
          toast.success(
            `Đã ${newStatus === "Hoạt động" ? "mở khóa" : "khóa"} tài khoản thành công`,
          );
          closeStatusDialog();
        },
        onError: (error) => {
          toast.error(
            `Không thể thay đổi trạng thái tài khoản: ${error.message}`,
          );
        },
      },
    );
  };

  const openStatusDialog = (userId, currentStatus) => {
    setStatusDialog({
      isOpen: true,
      userId,
      currentStatus,
    });
  };

  const closeStatusDialog = () => {
    setStatusDialog({
      isOpen: false,
      userId: null,
      currentStatus: null,
    });
  };

  const openPasswordDialog = (userId, username) => {
    setPasswordDialog({
      isOpen: true,
      userId,
      username,
      newPassword: "Haigiang@2025",
    });
  };

  const closePasswordDialog = () => {
    setPasswordDialog({
      isOpen: false,
      userId: null,
      username: null,
      newPassword: "",
    });
  };

  const handleResetPassword = () => {
    if (!passwordDialog.userId || !passwordDialog.newPassword) return;
    if (/\s/.test(passwordDialog.newPassword)) {
      toast.error("Mật khẩu không được chứa dấu cách.");
      return;
    }

    resetPasswordMutation.mutate({
      userId: passwordDialog.userId,
      newPassword: passwordDialog.newPassword,
    });
  };

  const openRoleDialog = (userId, currentRole, userName) => {
    setRoleDialog({
      isOpen: true,
      userId,
      currentRole,
      userName,
      newRole: null,
    });
  };

  // Handler to close role dialog
  const closeRoleDialog = () => {
    setRoleDialog({
      isOpen: false,
      userId: null,
      currentRole: null,
      newRole: null,
    });
  };

  const handleChangeRole = () => {
    const data = {
      userId: roleDialog.userId,
      roleId: roleDialog.newRole,
    };
    assignRoleMutation.mutate(data, {
      onSuccess: () => {
        closeRoleDialog();
      },
    });
  };

  const filteredData =
    allUsers.filter((teacher) => {
      if (teacher.roleName === "Hiệu trưởng") return false;
      if (roleFilter !== "all" && teacher.roleId !== roleFilter) return false;
      if (search) {
        const searchLower = cleanString(search.toLowerCase());
        return (
          teacher.fullName?.toLowerCase().includes(searchLower) ||
          teacher.email?.toLowerCase().includes(searchLower) ||
          teacher.phoneNumber?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    }) || [];

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const currentData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const startIndex = filteredData.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, filteredData.length);

  return (
    <div className="py-6">
      <h1 className="mb-6 text-2xl font-bold">Quản lý người dùng</h1>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="relative w-64">
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={filter.search}
              onChange={(e) =>
                setFilter({ ...filter, search: e.target.value, page: 1 })
              }
              className="pl-10"
            />
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Lọc vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {roles
                .filter((r) => r.roleName !== "Hiệu trưởng")
                .map((role) => (
                  <SelectItem value={role.roleID} key={role.roleID}>
                    {role.roleName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Hoạt động">Hoạt động</SelectItem>
              <SelectItem value="Không hoạt động">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="mb-6 overflow-hidden border border-gray-200">
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-auto">
            <Table className="table-fixed border-collapse">
              <TableHeader className="bg-slate-100">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-16 border border-gray-200 text-center">
                    STT
                  </TableHead>
                  <TableHead className="w-40 border border-gray-200 text-center">
                    Thao tác
                  </TableHead>
                  <TableHead className="w-48 border border-gray-200 text-center">
                    Tên cán bộ
                  </TableHead>
                  <TableHead className="w-32 border border-gray-200 text-center">
                    Vai trò
                  </TableHead>
                  <TableHead className="w-44 border border-gray-200 text-center">
                    Tên đăng nhập
                  </TableHead>
                  <TableHead className="w-56 border border-gray-200 text-center">
                    Email
                  </TableHead>
                  <TableHead className="w-32 border border-gray-200 text-center">
                    Điện thoại
                  </TableHead>

                  <TableHead className="w-32 border border-gray-200 text-center">
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userQuery.isPending ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="border border-gray-200 text-center"
                    >
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : currentData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="border border-gray-200 text-center"
                    >
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((user, index) => (
                    <TableRow
                      key={user.userId}
                      className="border-b border-gray-200"
                    >
                      <TableCell className="border border-gray-200 text-center">
                        {startIndex + index}
                      </TableCell>

                      <TableCell className="border border-gray-200">
                        <div className="flex justify-center space-x-2">
                          <CustomTooltip content="Thay đổi quyền">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer rounded-full bg-gray-100"
                              onClick={() =>
                                openRoleDialog(
                                  user.userId,
                                  user.roleName,
                                  user.username,
                                )
                              }
                            >
                              <UserRound className="h-4 w-4 text-amber-500" />
                            </Button>
                          </CustomTooltip>

                          <CustomTooltip content="Thay đổi khoá">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer rounded-full bg-gray-100"
                              onClick={() =>
                                openStatusDialog(user.userId, user.status)
                              }
                            >
                              <Lock className="h-4 w-4 text-blue-500" />
                            </Button>
                          </CustomTooltip>

                          <CustomTooltip content="Đặt lại mật khẩu">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer rounded-full bg-gray-100"
                              onClick={() =>
                                openPasswordDialog(user.userId, user.username)
                              }
                            >
                              <Key className="h-4 w-4 text-green-500" />
                            </Button>
                          </CustomTooltip>
                        </div>
                      </TableCell>

                      <TableCell className="border border-gray-200">
                        {user.fullName}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {user.roleName}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {user.username}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {user.email}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {user.phoneNumber}
                      </TableCell>
                      <TableCell className="border border-gray-200 text-center">
                        <Badge
                          className={
                            user.status === "Hoạt động"
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : "bg-red-500 hover:bg-red-600"
                          }
                          variant="default"
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <PaginationControls
          pageSize={pageSize}
          setFilter={setFilter}
          totalItems={filteredData.length || 0}
          startIndex={startIndex}
          endIndex={endIndex}
        />

        <MyPagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setFilter}
        />
      </div>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusDialog.isOpen} onOpenChange={closeStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {statusDialog.currentStatus === "Active"
                ? "Khóa tài khoản"
                : "Mở khóa tài khoản"}
            </DialogTitle>
            <DialogDescription>
              {statusDialog.currentStatus === "Active"
                ? "Bạn có chắc chắn muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập vào hệ thống."
                : "Bạn có chắc chắn muốn mở khóa tài khoản này? Người dùng sẽ có thể đăng nhập vào hệ thống."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={closeStatusDialog}
              className="mt-2 sm:mt-0"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant={
                statusDialog.currentStatus === "Active"
                  ? "destructive"
                  : "default"
              }
              onClick={handleStatusChange}
              className="mt-2 sm:mt-0"
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending
                ? "Đang xử lý..."
                : statusDialog.currentStatus === "Active"
                  ? "Khóa tài khoản"
                  : "Mở khóa tài khoản"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialog.isOpen} onOpenChange={closePasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Đặt lại mật khẩu cho tài khoản {passwordDialog.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="newPassword" className="text-center">
                Mật khẩu mới
              </Label>
              <CustomPasswordInput
                id="newPassword"
                value={passwordDialog.newPassword}
                onChange={(e) =>
                  setPasswordDialog({
                    ...passwordDialog,
                    newPassword: e.target.value,
                  })
                }
                className="mt-3"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={closePasswordDialog}
              className="mt-2 sm:mt-0"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleResetPassword}
              className="mt-2 sm:mt-0"
              disabled={
                resetPasswordMutation.isPending || !passwordDialog.newPassword
              }
            >
              {resetPasswordMutation.isPending
                ? "Đang xử lý..."
                : "Đặt lại mật khẩu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialog.isOpen} onOpenChange={closeRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi vai trò người dùng</DialogTitle>
            <DialogDescription>
              <p>Chọn vai trò mới cho người dùng {roleDialog.userName}</p>
              <p>Vai trò hiện tại: {roleDialog.currentRole}</p>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="roleSelect">Vai trò</Label>
            <Select
              id="roleSelect"
              value={roleDialog.newRole ? String(roleDialog.newRole) : ""}
              onValueChange={(value) =>
                setRoleDialog((prev) => ({ ...prev, newRole: +value }))
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roleQuery.data
                  ?.filter(
                    (role) =>
                      role.roleName !== roleDialog.currentRole &&
                      role.roleName !== "Hiệu trưởng",
                  )
                  .map((role) => (
                    <SelectItem value={String(role.roleID)} key={role.roleID}>
                      {role.roleName}
                    </SelectItem>
                  ))}

                {/* Add more roles as needed */}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={closeRoleDialog}
              className="mt-2 sm:mt-0"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleChangeRole}
              className="mt-2 sm:mt-0"
              disabled={
                !roleDialog.newRole ||
                roleDialog.newRole === roleDialog.currentRole
              }
            >
              Đổi vai trò
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
